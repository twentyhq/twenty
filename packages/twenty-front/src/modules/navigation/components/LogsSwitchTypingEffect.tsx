import { type LogsSwitchTypingSequence } from '@/navigation/types/LogsSwitchTypingSequence';
import { useEffect } from 'react';

type LogsSwitchTypingEffectProps = {
  sequence: LogsSwitchTypingSequence;
  onSequenceChange: (sequence: LogsSwitchTypingSequence) => void;
};

export const LogsSwitchTypingEffect = ({
  sequence,
  onSequenceChange,
}: LogsSwitchTypingEffectProps) => {
  useEffect(() => {
    if (sequence.index >= sequence.frames.length - 1) {
      return;
    }

    const timeoutId = setTimeout(
      () => onSequenceChange({ ...sequence, index: sequence.index + 1 }),
      sequence.frames[sequence.index].delayAfterMs,
    );

    return () => clearTimeout(timeoutId);
  }, [sequence, onSequenceChange]);

  return null;
};
