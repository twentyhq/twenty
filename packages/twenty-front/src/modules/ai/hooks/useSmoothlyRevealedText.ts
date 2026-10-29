import { useState } from 'react';

import { getNextRevealedTextLength } from '@/ai/utils/getNextRevealedTextLength';

type TextReveal = {
  revealedText: string;
  revealedAtTimestamp: number | null;
};

export const useSmoothlyRevealedText = ({
  text,
  isStreaming,
}: {
  text: string;
  isStreaming: boolean;
}) => {
  const [textReveal, setTextReveal] = useState<TextReveal>({
    revealedText: isStreaming ? '' : text,
    revealedAtTimestamp: null,
  });

  const isAppendedText = text.startsWith(textReveal.revealedText);

  if (!isAppendedText) {
    setTextReveal({ revealedText: text, revealedAtTimestamp: null });
  }

  const isRevealing =
    isAppendedText && textReveal.revealedText.length < text.length;

  const revealNextFrame = (frameTimestamp: number) => {
    setTextReveal({
      revealedText: text.slice(
        0,
        getNextRevealedTextLength({
          text,
          revealedLength: textReveal.revealedText.length,
          elapsedMs:
            frameTimestamp - (textReveal.revealedAtTimestamp ?? frameTimestamp),
        }),
      ),
      revealedAtTimestamp: frameTimestamp,
    });
  };

  return {
    revealedText: isAppendedText ? textReveal.revealedText : text,
    isRevealing,
    revealNextFrame,
  };
};
