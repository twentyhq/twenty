import { type DeveloperModeTypingSequence } from '@/navigation/types/DeveloperModeTypingSequence';
import { useEffect } from 'react';

type DeveloperModeTypingEffectProps = {
  sequence: DeveloperModeTypingSequence;
  onSequenceChange: (sequence: DeveloperModeTypingSequence) => void;
};

export const DeveloperModeTypingEffect = ({
  sequence,
  onSequenceChange,
}: DeveloperModeTypingEffectProps) => {
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
