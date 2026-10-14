import { getDeveloperModeTypingFrames } from '@/navigation/utils/getDeveloperModeTypingFrames';
import { useLingui } from '@lingui/react/macro';
import { useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useDeveloperModeTypingLine = (isEnabled: boolean) => {
  const { t } = useLingui();
  const shouldReduceMotion = useReducedMotion();
  const [typedLine, setTypedLine] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const restingLine = t`CLI`;

  const clearPendingFrame = () => {
    if (isDefined(timeoutRef.current)) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => clearPendingFrame, []);

  const stopTyping = () => {
    clearPendingFrame();
    setTypedLine(null);
  };

  const startTyping = () => {
    stopTyping();

    if (shouldReduceMotion === true) {
      return;
    }

    const frames = getDeveloperModeTypingFrames({
      greeting: t`welcome backstage`,
      words: [t`logs`, t`APIs`, t`webhooks`],
      restingWord: restingLine,
    });

    const playFrame = (index: number) => {
      const frame = frames[index];
      setTypedLine(frame.text);

      if (index < frames.length - 1) {
        timeoutRef.current = setTimeout(
          () => playFrame(index + 1),
          frame.delayAfterMs,
        );
      } else {
        timeoutRef.current = null;
      }
    };

    playFrame(0);
  };

  return {
    line: isEnabled ? (typedLine ?? restingLine) : null,
    startTyping,
    stopTyping,
  };
};
