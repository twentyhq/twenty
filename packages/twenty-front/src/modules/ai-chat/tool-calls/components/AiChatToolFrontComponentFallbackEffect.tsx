import { useEffect } from 'react';

type AiChatToolFrontComponentFallbackEffectProps = {
  onFallback: () => void;
};

export const AiChatToolFrontComponentFallbackEffect = ({
  onFallback,
}: AiChatToolFrontComponentFallbackEffectProps) => {
  useEffect(() => {
    onFallback();
  }, [onFallback]);

  return null;
};
