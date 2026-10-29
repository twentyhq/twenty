import { useEffect } from 'react';

type AiChatTextRevealEffectProps = {
  onAnimationFrame: (frameTimestamp: number) => void;
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
