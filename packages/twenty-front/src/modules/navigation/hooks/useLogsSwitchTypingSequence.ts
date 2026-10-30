import { LOGS_SWITCH_PHRASES } from '@/navigation/constants/LogsSwitchPhrases';
import { type LogsSwitchTypingSequence } from '@/navigation/types/LogsSwitchTypingSequence';
import { getLogsSwitchDisplayedFrame } from '@/navigation/utils/getLogsSwitchDisplayedFrame';
import { getLogsSwitchEnterFrames } from '@/navigation/utils/getLogsSwitchEnterFrames';
import { getLogsSwitchExitFrames } from '@/navigation/utils/getLogsSwitchExitFrames';
import { getNextLogsSwitchPhraseIndex } from '@/navigation/utils/getNextLogsSwitchPhraseIndex';
import { useLingui } from '@lingui/react/macro';
import { useReducedMotion } from 'framer-motion';
import { useState } from 'react';

export const useLogsSwitchTypingSequence = (isEnabled: boolean) => {
  const { t } = useLingui();
  const shouldReduceMotion = useReducedMotion();
  const [sequence, setSequence] = useState<LogsSwitchTypingSequence | null>(
    null,
  );
  const [previousPhraseIndex, setPreviousPhraseIndex] = useState<number | null>(
    null,
  );
  const [previousIsEnabled, setPreviousIsEnabled] = useState(isEnabled);

  if (isEnabled !== previousIsEnabled) {
    setPreviousIsEnabled(isEnabled);

    if (sequence?.direction !== (isEnabled ? 'enter' : 'exit')) {
      setSequence(null);
    }
  }

  const label = t`Logs`;
  const isEntering =
    sequence?.direction === 'enter' &&
    sequence.index < sequence.frames.length - 1;

  const playEnterSequence = () => {
    if (shouldReduceMotion) {
      setSequence(null);
      return;
    }

    const phraseIndex = getNextLogsSwitchPhraseIndex({
      phraseCount: LOGS_SWITCH_PHRASES.length,
      previousPhraseIndex,
    });

    setPreviousPhraseIndex(phraseIndex);
    setSequence({
      direction: 'enter',
      frames: getLogsSwitchEnterFrames({
        label,
        phrase: t(LOGS_SWITCH_PHRASES[phraseIndex]),
      }),
      index: 0,
    });
  };

  const playExitSequence = () => {
    if (shouldReduceMotion || isEntering) {
      setSequence(null);
      return;
    }

    setSequence({
      direction: 'exit',
      frames: getLogsSwitchExitFrames(label),
      index: 0,
    });
  };

  return {
    label,
    sequence,
    setSequence,
    displayedFrame: getLogsSwitchDisplayedFrame({
      isEnabled,
      label,
      sequence,
    }),
    isTyping: isEnabled && isEntering,
    playEnterSequence,
    playExitSequence,
  };
};
