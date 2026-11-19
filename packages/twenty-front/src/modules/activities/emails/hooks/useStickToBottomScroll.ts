import { useEffect, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';

const BOTTOM_THRESHOLD_IN_PX = 8;

export const useStickToBottomScroll = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    const scrollContent = scrollContentRef.current;

    if (!isDefined(scrollContainer) || !isDefined(scrollContent)) {
      return;
    }

    let isPinnedToBottom = true;
    let lastScrollTop = scrollContainer.scrollTop;

    // Only scrolling up unpins: content can grow again before the scroll event
    // of our own scroll to the bottom fires, which then looks far from the bottom
    const handleScroll = () => {
      const { scrollHeight, scrollTop, clientHeight } = scrollContainer;

      if (scrollHeight - scrollTop - clientHeight <= BOTTOM_THRESHOLD_IN_PX) {
        isPinnedToBottom = true;
      } else if (scrollTop < lastScrollTop) {
        isPinnedToBottom = false;
      }

      lastScrollTop = scrollTop;
    };

    // Media loads after its message renders, so heights change without a new message
    const resizeObserver = new ResizeObserver(() => {
      if (isPinnedToBottom) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    });

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    resizeObserver.observe(scrollContainer);
    resizeObserver.observe(scrollContent);

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, []);

  return { scrollContainerRef, scrollContentRef };
};
