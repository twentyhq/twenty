import { type LivenessWatchdog } from '@/ai/dictation/types/LivenessWatchdog';
// iOS can accept start() and then emit nothing, so liveness is measured.
export const createLivenessWatchdog = ({
  timeoutInMs,
  onSilent,
}: {
  timeoutInMs: number;
  onSilent: () => void;
}): LivenessWatchdog => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let hasSeenActivity = false;

  const clear = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return {
    arm: () => {
      clear();
      hasSeenActivity = false;
      timer = setTimeout(() => {
        timer = null;
        if (!hasSeenActivity) {
          onSilent();
        }
      }, timeoutInMs);
    },
    // Any sign of life counts, so a slow speaker isn't read as a dead engine.
    noteActivity: () => {
      hasSeenActivity = true;
      clear();
    },
    disarm: clear,
  };
};
