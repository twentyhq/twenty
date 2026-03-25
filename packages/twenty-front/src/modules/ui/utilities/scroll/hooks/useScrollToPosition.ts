import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useCallback } from 'react';

export const useScrollToPosition = () => {
  const { scrollWrapperHTMLElement } = useScrollWrapperHTMLElement();

  const scrollToPosition = useCallback(
    (scrollPositionInPx: number) => {
      scrollWrapperHTMLElement?.scrollTo({
        top: scrollPositionInPx,
      });
    },
    [scrollWrapperHTMLElement],
  );

  return { scrollToPosition };
};
