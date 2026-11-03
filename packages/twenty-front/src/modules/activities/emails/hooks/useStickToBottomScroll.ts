import { type UIEvent, useEffect, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

const BOTTOM_THRESHOLD_IN_PX = 8;

export const useStickToBottomScroll = (contentSize: number) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPinnedToBottom, setIsPinnedToBottom] = useState(true);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;

    if (isDefined(scrollContainer) && isPinnedToBottom) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [contentSize, isPinnedToBottom]);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const { scrollHeight, scrollTop, clientHeight } = event.currentTarget;

    setIsPinnedToBottom(
      scrollHeight - scrollTop - clientHeight <= BOTTOM_THRESHOLD_IN_PX,
    );
  };

  return { scrollContainerRef, handleScroll };
};
