/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipForward, SkipBack, Terminal, AlertTriangle, Activity } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SPEED = 120;

const AUDIO_TRACKS = [
  { id: '0x01', title: "AI_GEN_PROTOCOL_ALPHA.wav", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: '0x02', title: "NEURAL_SYNTH_BETA.wav", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: '0x03', title: "VOID_ECHO_GAMMA.wav", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" }
];

export default function App() {
  // --- CYBER-SERPENT STATE ---
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 5 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  
  const dirRef = useRef({ x: 0, y: -1 });
  const gameLoopRef = useRef<number | null>(null);

  // --- AUDITORY PROTOCOL STATE ---
  const [trackIdx, setTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- AUDIO LOGIC ---
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {
          console.error("AUDIO_SUBSYSTEM_FAILURE: Interaction required.");
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, trackIdx]);

  const handleNextTrack = () => setTrackIdx((i) => (i + 1) % AUDIO_TRACKS.length);
  const handlePrevTrack = () => setTrackIdx((i) => (i - 1 + AUDIO_TRACKS.length) % AUDIO_TRACKS.length);
  const togglePlay = () => setIsPlaying(!isPlaying);

  // --- GAME LOGIC ---
  const spawnFood = useCallback((currentSnake: {x: number, y: number}[]) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      // eslint-disable-next-line no-loop-func
      if (!currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  }, []);

  const resetSimulation = () => {
    setSnake([{ x: 10, y: 10 }]);
    dirRef.current = { x: 0, y: -1 };
    setScore(0);
    setGameOver(false);
    setFood(spawnFood([{ x: 10, y: 10 }]));
    setIsStarted(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isStarted && e.key === 'Enter') {
        resetSimulation();
        return;
      }
      
      if (gameOver && e.key === 'Enter') {
        resetSimulation();
        return;
      }

      // Prevent default scrolling for arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          if (dirRef.current.y !== 1) dirRef.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
          if (dirRef.current.y !== -1) dirRef.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
          if (dirRef.current.x !== 1) dirRef.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
          if (dirRef.current.x !== -1) dirRef.current = { x: 1, y: 0 };
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStarted, gameOver, spawnFood]);

  useEffect(() => {
    if (!isStarted || gameOver) return;

    const moveSnake = () => {
      setSnake(prev => {
        const head = prev[0];
        const newHead = { x: head.x + dirRef.current.x, y: head.y + dirRef.current.y };

        // Wall Collision
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          setGameOver(true);
          return prev;
        }

        // Self Collision
        if (prev.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          return prev;
        }

        const newSnake = [newHead, ...prev];

        // Food Collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 1);
          setFood(spawnFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    // Speed increases slightly as score goes up
    const currentSpeed = Math.max(40, INITIAL_SPEED - (score * 2));
    gameLoopRef.current = window.setInterval(moveSnake, currentSpeed);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isStarted, gameOver, food, score, spawnFood]);

  return (
    <div className="min-h-screen w-full bg-void text-cyan font-mono crt tear flex flex-col items-center justify-between p-4 selection:bg-magenta selection:text-void">
      
      {/* HEADER */}
      <header className="w-full max-w-4xl flex justify-between items-end border-b-2 border-magenta pb-2 mb-4 glitch-text">
        <div>
          <h1 className="text-3xl font-bold tracking-widest flex items-center gap-2">
            <Terminal className="text-magenta" /> SYSTEM.OS // NEON_SERPENT
          </h1>
          <p className="text-xs opacity-70 uppercase tracking-widest mt-1">
            Status: {gameOver ? 'FATAL_EXCEPTION' : isStarted ? 'SIMULATION_ACTIVE' : 'AWAITING_INPUT'}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-magenta">
            DATA_HARVESTED: {score.toString().padStart(4, '0')}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 w-full max-w-6xl">
        
        {/* GAME BOARD */}
        <div className="relative">
          <div 
            className="neon-border-cyan glitch-box bg-black/80 p-1 relative z-10"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
              width: 'min(80vw, 500px)',
              height: 'min(80vw, 500px)'
            }}
          >
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
              const x = i % GRID_SIZE;
              const y = Math.floor(i / GRID_SIZE);
              
              const isHead = snake[0].x === x && snake[0].y === y;
              const isBody = snake.some((s, idx) => idx !== 0 && s.x === x && s.y === y);
              const isFood = food.x === x && food.y === y;

              return (
                <div 
                  key={i} 
                  className={`
                    w-full h-full border-[0.5px] border-cyan/10
                    ${isHead ? 'neon-bg-cyan z-20' : ''}
                    ${isBody ? 'bg-cyan/60 shadow-[0_0_8px_#00FFFF] z-10' : ''}
                    ${isFood ? 'neon-bg-magenta animate-pulse z-20' : ''}
                  `}
                />
              );
            })}
          </div>

          {/* OVERLAYS */}
          {!isStarted && !gameOver && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-void/80 backdrop-blur-sm neon-border-magenta">
              <Activity className="w-16 h-16 text-magenta mb-4 animate-pulse" />
              <h2 className="text-2xl glitch-text mb-2">INITIALIZE_PROTOCOL</h2>
              <p className="text-sm opacity-80 animate-pulse">PRESS [ENTER] TO EXECUTE</p>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-void/90 backdrop-blur-md neon-border-magenta">
              <AlertTriangle className="w-16 h-16 text-magenta mb-4 glitch-text" />
              <h2 className="text-3xl text-magenta font-bold mb-2 glitch-text">SYSTEM_HALT</h2>
              <p className="text-cyan mb-6">COLLISION_DETECTED // DATA_LOST</p>
              <button 
                onClick={resetSimulation}
                className="px-6 py-2 neon-border-cyan text-cyan hover:bg-cyan hover:text-void transition-colors uppercase tracking-widest font-bold"
              >
                REBOOT_SEQUENCE
              </button>
            </div>
          )}
        </div>

        {/* SIDE PANEL / AUDIO CONTROLS */}
        <aside className="w-full lg:w-80 flex flex-col gap-6">
          <div className="neon-border-magenta p-4 bg-black/50 backdrop-blur">
            <h3 className="text-magenta text-sm tracking-widest border-b border-magenta/30 pb-2 mb-4 flex items-center gap-2">
              <Activity size={16} /> AUDITORY_STIMULATION
            </h3>
            
            <div className="mb-6">
              <p className="text-xs text-cyan/70 mb-1">CURRENT_STREAM:</p>
              <p className="text-lg glitch-text truncate" title={AUDIO_TRACKS[trackIdx].title}>
                {AUDIO_TRACKS[trackIdx].title}
              </p>
              <div className="w-full h-1 bg-cyan/20 mt-2 overflow-hidden relative">
                {isPlaying && <div className="absolute top-0 left-0 h-full bg-cyan w-full animate-[pulse_1s_ease-in-out_infinite]" style={{ transformOrigin: 'left', animation: 'scale-x 2s infinite alternate' }} />}
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <button onClick={handlePrevTrack} className="p-2 text-cyan hover:text-magenta transition-colors">
                <SkipBack size={24} />
              </button>
              <button 
                onClick={togglePlay} 
                className="p-4 neon-border-cyan text-cyan hover:bg-cyan hover:text-void transition-all rounded-full"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
              </button>
              <button onClick={handleNextTrack} className="p-2 text-cyan hover:text-magenta transition-colors">
                <SkipForward size={24} />
              </button>
            </div>

            <audio 
              ref={audioRef} 
              src={AUDIO_TRACKS[trackIdx].url} 
              onEnded={handleNextTrack}
              loop={false}
              className="hidden"
            />
          </div>

          <div className="neon-border-cyan p-4 bg-black/50 backdrop-blur text-xs">
            <h3 className="text-cyan text-sm tracking-widest border-b border-cyan/30 pb-2 mb-2">
              OPERATING_MANUAL
            </h3>
            <ul className="space-y-2 opacity-80 text-blue-400">
              <li>&gt; USE [W,A,S,D] OR [ARROWS] TO NAVIGATE</li>
              <li>&gt; CONSUME MAGENTA DATA PACKETS</li>
              <li>&gt; AVOID BOUNDARY INTERSECTIONS</li>
              <li>&gt; AVOID SELF-INTERSECTIONS</li>
            </ul>
          </div>
        </aside>
      </main>

      {/* FOOTER */}
      <footer className="w-full max-w-4xl text-center text-xs opacity-50 mt-8 pb-2">
        <p>WARNING: PROLONGED EXPOSURE MAY CAUSE NEURAL DESYNC.</p>
        <p>v.9.4.2 // UNREGISTERED HYPERVISOR</p>
      </footer>
    </div>
  );
}
