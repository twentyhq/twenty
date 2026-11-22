import { type LivenessWatchdog } from '@/ai-chat/dictation/types/LivenessWatchdog';
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
    noteActivity: () => {
      hasSeenActivity = true;
      clear();
    },
    disarm: clear,
  };
};
