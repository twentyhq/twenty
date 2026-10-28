import { useEffect, useState } from 'react';

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

  // a rewrite rather than an append is shown whole
  if (!isAppendedText) {
    setTextReveal({ revealedText: text, revealedAtInMs: null });
  }

  const isRevealing =
    isAppendedText && textReveal.revealedText.length < text.length;

  useEffect(() => {
    if (!isRevealing) {
      return;
    }

    const animationFrameId = requestAnimationFrame((frameAtInMs) => {
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
    });

    return () => cancelAnimationFrame(animationFrameId);
  }, [isRevealing, text, textReveal]);

  const revealedText = isAppendedText ? textReveal.revealedText : text;

  // the first word shows at once so a starting answer never renders empty
  return {
    revealedText:
      revealedText.trim().length === 0
        ? (/^\s*\S+/.exec(text)?.[0] ?? revealedText)
        : revealedText,
    isRevealing,
  };
};
