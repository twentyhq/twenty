import { useScrollWrapperElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperElement';

export const useScrollToPosition = () => {
  const { scrollWrapperHTMLElement } = useScrollWrapperElement();

  const scrollToPosition = (scrollPositionInPx: number) => {
    scrollWrapperHTMLElement?.scrollTo({ top: scrollPositionInPx });
  };

  return { scrollToPosition };
};
