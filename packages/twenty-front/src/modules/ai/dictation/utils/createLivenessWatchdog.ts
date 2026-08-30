import { type LivenessWatchdog } from '@/ai/dictation/types/LivenessWatchdog';
// iOS can accept start() and then emit nothing at all, so liveness is measured
// rather than assumed. Kept free of browser APIs beyond timers so the rule that
// decides whether dictation is working can be tested without a microphone.
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
    // Any sign of life counts, not just a transcript: audio opening proves the
    // engine is running, and a slow speaker should not read as a dead engine.
    noteActivity: () => {
      hasSeenActivity = true;
      clear();
    },
    disarm: clear,
  };
};
