import { DEVELOPER_MODE_PHRASES } from '@/navigation/constants/DeveloperModePhrases';
import { type DeveloperModeTypingSequence } from '@/navigation/types/DeveloperModeTypingSequence';
import { getDeveloperModeDisplayedFrame } from '@/navigation/utils/getDeveloperModeDisplayedFrame';
import { getDeveloperModeEnterFrames } from '@/navigation/utils/getDeveloperModeEnterFrames';
import { getDeveloperModeExitFrames } from '@/navigation/utils/getDeveloperModeExitFrames';
import { getNextDeveloperModePhraseIndex } from '@/navigation/utils/getNextDeveloperModePhraseIndex';
import { useLingui } from '@lingui/react/macro';
import { useReducedMotion } from 'framer-motion';
import { useState } from 'react';

export const useDeveloperModeTypingSequence = (isEnabled: boolean) => {
  const { t } = useLingui();
  const shouldReduceMotion = useReducedMotion();
  const [sequence, setSequence] = useState<DeveloperModeTypingSequence | null>(
    null,
  );
  const [previousPhraseIndex, setPreviousPhraseIndex] = useState<number | null>(
    null,
  );

  const label = t`Developer mode`;
  const isEntering =
    sequence?.direction === 'enter' &&
    sequence.index < sequence.frames.length - 1;

  const playEnterSequence = () => {
    if (shouldReduceMotion) {
      setSequence(null);
      return;
    }

    const phraseIndex = getNextDeveloperModePhraseIndex({
      phraseCount: DEVELOPER_MODE_PHRASES.length,
      previousPhraseIndex,
    });

    setPreviousPhraseIndex(phraseIndex);
    setSequence({
      direction: 'enter',
      frames: getDeveloperModeEnterFrames({
        label,
        phrase: t(DEVELOPER_MODE_PHRASES[phraseIndex]),
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
      frames: getDeveloperModeExitFrames(label),
      index: 0,
    });
  };

  return {
    label,
    sequence,
    setSequence,
    displayedFrame: getDeveloperModeDisplayedFrame({
      isEnabled,
      label,
      sequence,
    }),
    isTyping: isEnabled && isEntering,
    playEnterSequence,
    playExitSequence,
  };
};
