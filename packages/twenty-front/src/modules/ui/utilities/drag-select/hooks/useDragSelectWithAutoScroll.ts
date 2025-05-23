import { useCallback } from 'react';

import { useScrollToPosition } from '@/ui/utilities/scroll/hooks/useScrollToPosition';
import { useScrollWrapperElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperElement';
import { scrollWrapperScrollLeftComponentState } from '@/ui/utilities/scroll/states/scrollWrapperScrollLeftComponentState';
import { scrollWrapperScrollTopComponentState } from '@/ui/utilities/scroll/states/scrollWrapperScrollTopComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isDefined } from 'twenty-shared/utils';
import { AUTO_SCROLL_EDGE_THRESHOLD_PX } from '../constants/AutoScrollEdgeThresholdPx';
import { AUTO_SCROLL_MAX_SPEED_PX } from '../constants/AutoScrollMaxSpeedPx';

type UseDragSelectWithAutoScrollProps = {
  scrollWrapperComponentInstanceId?: string;
};

export const useDragSelectWithAutoScroll = ({
  scrollWrapperComponentInstanceId,
}: UseDragSelectWithAutoScrollProps) => {
  const { scrollToPosition } = useScrollToPosition();
  const { scrollWrapperHTMLElement } = useScrollWrapperElement(
    scrollWrapperComponentInstanceId,
  );
  const scrollTop = useRecoilComponentValueV2(
    scrollWrapperScrollTopComponentState,
  );
  const scrollLeft = useRecoilComponentValueV2(
    scrollWrapperScrollLeftComponentState,
  );

  const handleAutoScroll = useCallback(
    (mouseX: number, mouseY: number) => {
      if (!isDefined(scrollWrapperHTMLElement)) return;

      const containerRect = scrollWrapperHTMLElement.getBoundingClientRect();

      const nearTop =
        mouseY - containerRect.top < AUTO_SCROLL_EDGE_THRESHOLD_PX;
      const nearBottom =
        containerRect.bottom - mouseY < AUTO_SCROLL_EDGE_THRESHOLD_PX;
      const nearLeft =
        mouseX - containerRect.left < AUTO_SCROLL_EDGE_THRESHOLD_PX;
      const nearRight =
        containerRect.right - mouseX < AUTO_SCROLL_EDGE_THRESHOLD_PX;

      if (nearTop) {
        const newScrollTop = Math.max(0, scrollTop - AUTO_SCROLL_MAX_SPEED_PX);
        scrollToPosition(newScrollTop);
      } else if (nearBottom) {
        const newScrollTop = scrollTop + AUTO_SCROLL_MAX_SPEED_PX;
        scrollToPosition(newScrollTop);
      }

      if (nearLeft) {
        const newScrollLeft = Math.max(
          0,
          scrollLeft - AUTO_SCROLL_MAX_SPEED_PX,
        );
        scrollWrapperHTMLElement.scrollTo({
          left: newScrollLeft,
          behavior: 'auto',
        });
      } else if (nearRight) {
        const newScrollLeft = scrollLeft + AUTO_SCROLL_MAX_SPEED_PX;
        scrollWrapperHTMLElement.scrollTo({
          left: newScrollLeft,
          behavior: 'auto',
        });
      }
    },
    [scrollWrapperHTMLElement, scrollTop, scrollLeft, scrollToPosition],
  );

  return {
    handleAutoScroll,
  };
};
