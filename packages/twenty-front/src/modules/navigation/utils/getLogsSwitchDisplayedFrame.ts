import { type LogsSwitchTypingFrame } from '@/navigation/types/LogsSwitchTypingFrame';
import { type LogsSwitchTypingSequence } from '@/navigation/types/LogsSwitchTypingSequence';
import { getLogsSwitchCodeFontFrame } from '@/navigation/utils/getLogsSwitchCodeFontFrame';
import { isDefined } from 'twenty-shared/utils';

export const getLogsSwitchDisplayedFrame = ({
  isEnabled,
  label,
  sequence,
}: {
  isEnabled: boolean;
  label: string;
  sequence: LogsSwitchTypingSequence | null;
}): LogsSwitchTypingFrame | null => {
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

  return getLogsSwitchCodeFontFrame({ text: label, delayAfterMs: 0 });
};
