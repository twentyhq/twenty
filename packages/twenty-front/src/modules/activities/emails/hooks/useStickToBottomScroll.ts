import { useEffect, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { watchStickToBottomScroll } from '@/ui/utilities/scroll/utils/watchStickToBottomScroll';

export const useStickToBottomScroll = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainerElement = scrollContainerRef.current;
    const scrollContentElement = scrollContentRef.current;

    if (
      !isDefined(scrollContainerElement) ||
      !isDefined(scrollContentElement)
    ) {
      return;
    }

    return watchStickToBottomScroll({
      scrollContainerElement,
      scrollContentElement,
    });
  }, []);

  return { scrollContainerRef, scrollContentRef };
};
