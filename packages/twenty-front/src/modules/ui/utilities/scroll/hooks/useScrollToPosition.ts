import { useScrollWrapperElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperElement';
import { useCallback } from 'react';

export const useScrollToPosition = () => {
  const { scrollWrapperHTMLElement } = useScrollWrapperElement();

  const scrollToPosition = useCallback(
    (scrollPositionInPx: number) => {
      scrollWrapperHTMLElement?.scrollTo({ top: scrollPositionInPx });
    },
    [scrollWrapperHTMLElement],
  );

  return { scrollToPosition };
};
