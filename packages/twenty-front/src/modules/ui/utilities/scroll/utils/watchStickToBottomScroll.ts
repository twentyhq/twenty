const BOTTOM_THRESHOLD_IN_PX = 8;

export const watchStickToBottomScroll = ({
  scrollContainerElement,
  scrollContentElement,
}: {
  scrollContainerElement: HTMLElement;
  scrollContentElement: HTMLElement;
}) => {
  let isPinnedToBottom = true;
  let lastScrollTop = scrollContainerElement.scrollTop;

  // Only scrolling up unpins: growth can land before our own scroll event fires
  const handleScroll = () => {
    const { scrollHeight, scrollTop, clientHeight } = scrollContainerElement;

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
      scrollContainerElement.scrollTop = scrollContainerElement.scrollHeight;
    }
  });

  scrollContainerElement.addEventListener('scroll', handleScroll, {
    passive: true,
  });
  resizeObserver.observe(scrollContainerElement);
  resizeObserver.observe(scrollContentElement);

  return () => {
    scrollContainerElement.removeEventListener('scroll', handleScroll);
    resizeObserver.disconnect();
  };
};
