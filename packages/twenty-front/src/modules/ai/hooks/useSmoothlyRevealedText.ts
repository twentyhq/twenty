import { useState } from 'react';

import { getNextRevealedTextLength } from '@/ai/utils/getNextRevealedTextLength';

type TextReveal = {
  revealedText: string;
  revealedAtInMs: number | null;
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
    revealedAtInMs: null,
  });

  const isAppendedText = text.startsWith(textReveal.revealedText);

  if (!isAppendedText) {
    setTextReveal({ revealedText: text, revealedAtInMs: null });
  }

  const isRevealing =
    isAppendedText && textReveal.revealedText.length < text.length;

  const revealNextFrame = (frameAtInMs: number) => {
    setTextReveal({
      revealedText: text.slice(
        0,
        getNextRevealedTextLength({
          text,
          revealedLength: textReveal.revealedText.length,
          elapsedMs: frameAtInMs - (textReveal.revealedAtInMs ?? frameAtInMs),
        }),
      ),
      revealedAtInMs: frameAtInMs,
    });
  };

  const revealedText = isAppendedText ? textReveal.revealedText : text;

  if (revealedText.trim().length > 0) {
    return { revealedText, isRevealing, revealNextFrame };
  }

  // the first word shows at once so a starting answer never renders empty
  return {
    revealedText: /^\s*\S+/.exec(text)?.[0] ?? revealedText,
    isRevealing,
    revealNextFrame,
  };
};
