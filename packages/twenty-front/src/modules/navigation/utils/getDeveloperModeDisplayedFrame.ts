import { type DeveloperModeTypingFrame } from '@/navigation/types/DeveloperModeTypingFrame';
import { type DeveloperModeTypingSequence } from '@/navigation/types/DeveloperModeTypingSequence';
import { getDeveloperModeCodeFontFrame } from '@/navigation/utils/getDeveloperModeCodeFontFrame';
import { isDefined } from 'twenty-shared/utils';

export const getDeveloperModeDisplayedFrame = ({
  isEnabled,
  label,
  sequence,
}: {
  isEnabled: boolean;
  label: string;
  sequence: DeveloperModeTypingSequence | null;
}): DeveloperModeTypingFrame | null => {
  const isSequenceRunning =
    isDefined(sequence) && sequence.index < sequence.frames.length - 1;
  const sequenceFrame = isSequenceRunning
    ? sequence.frames[sequence.index]
    : null;

  if (!isEnabled) {
    return sequence?.direction === 'exit' && isDefined(sequenceFrame)
      ? sequenceFrame
      : null;
  }

  if (sequence?.direction === 'enter' && isDefined(sequenceFrame)) {
    return sequenceFrame;
  }

  return getDeveloperModeCodeFontFrame({ text: label, delayAfterMs: 0 });
};
