import { useEffect } from 'react';

type AiChatTextRevealEffectProps = {
  onAnimationFrame: (frameAtInMs: number) => void;
};

export const AiChatTextRevealEffect = ({
  onAnimationFrame,
}: AiChatTextRevealEffectProps) => {
  useEffect(() => {
    const animationFrameId = requestAnimationFrame(onAnimationFrame);

    return () => cancelAnimationFrame(animationFrameId);
  }, [onAnimationFrame]);

  return null;
};
