import { useCallback, useMemo } from 'react';

import { ScrollWrapperComponentInstanceContext } from '@/ui/utilities/scroll/states/contexts/ScrollWrapperComponentInstanceContext';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { AUTO_SCROLL_EDGE_THRESHOLD_PX } from '@/ui/utilities/drag-select/constants/AutoScrollEdgeThresholdPx';
import { AUTO_SCROLL_MAX_SPEED_PX } from '@/ui/utilities/drag-select/constants/AutoScrollMaxSpeedPx';

type UseDragSelectWithAutoScrollProps = {
  scrollWrapperComponentInstanceId?: string;
};

export const useDragSelectWithAutoScroll = ({
  scrollWrapperComponentInstanceId,
}: UseDragSelectWithAutoScrollProps) => {
  const instanceStateContext = useComponentInstanceStateContext(
    ScrollWrapperComponentInstanceContext,
  );

  const instanceIdFromContext = instanceStateContext?.instanceId;

  const scrollWrapperInstanceId = useMemo(() => {
    if (isNonEmptyString(scrollWrapperComponentInstanceId)) {
      return scrollWrapperComponentInstanceId;
    } else if (isNonEmptyString(instanceIdFromContext)) {
      return instanceIdFromContext;
    }
    return null;
  }, [scrollWrapperComponentInstanceId, instanceIdFromContext]);

  const hasScrollWrapper = isDefined(scrollWrapperInstanceId);

  const handleAutoScroll = useCallback(
    (mouseX: number, mouseY: number) => {
      if (!hasScrollWrapper || !scrollWrapperInstanceId) {
        return;
      }

      const scrollWrapperHTMLElement = document.getElementById(
        `scroll-wrapper-${scrollWrapperInstanceId}`,
      );

      if (!scrollWrapperHTMLElement) {
        return;
      }

      const containerRect = scrollWrapperHTMLElement.getBoundingClientRect();

      const nearTop =
        mouseY - containerRect.top < AUTO_SCROLL_EDGE_THRESHOLD_PX;
      const nearBottom =
        containerRect.bottom - mouseY < AUTO_SCROLL_EDGE_THRESHOLD_PX;
      const nearLeft =
        mouseX - containerRect.left < AUTO_SCROLL_EDGE_THRESHOLD_PX;
      const nearRight =
        containerRect.right - mouseX < AUTO_SCROLL_EDGE_THRESHOLD_PX;

      const currentScrollTop = scrollWrapperHTMLElement.scrollTop;
      const currentScrollLeft = scrollWrapperHTMLElement.scrollLeft;

      if (nearTop) {
        const newScrollTop = Math.max(
          0,
          currentScrollTop - AUTO_SCROLL_MAX_SPEED_PX,
        );
        scrollWrapperHTMLElement.scrollTo({ top: newScrollTop });
      } else if (nearBottom) {
        const newScrollTop = currentScrollTop + AUTO_SCROLL_MAX_SPEED_PX;
        scrollWrapperHTMLElement.scrollTo({ top: newScrollTop });
      }

      if (nearLeft) {
        const newScrollLeft = Math.max(
          0,
          currentScrollLeft - AUTO_SCROLL_MAX_SPEED_PX,
        );
        scrollWrapperHTMLElement.scrollTo({
          left: newScrollLeft,
          behavior: 'auto',
        });
      } else if (nearRight) {
        const newScrollLeft = currentScrollLeft + AUTO_SCROLL_MAX_SPEED_PX;
        scrollWrapperHTMLElement.scrollTo({
          left: newScrollLeft,
          behavior: 'auto',
        });
      }
    },
    [hasScrollWrapper, scrollWrapperInstanceId],
  );

  return {
    handleAutoScroll,
  };
};
