import { SCROLL_RESTORATION_TOP_THRESHOLD_PX } from '@/ui/utilities/scroll/constants/ScrollRestorationTopThreshold';
import { scrollWrapperScrollTopComponentState } from '@/ui/utilities/scroll/states/scrollWrapperScrollTopComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

export const useScrollRestoration = (componentInstanceId: string) => {
  const location = useLocation();
  const storageKey = `scroll-${location.pathname}`;
  const [isRestoring, setIsRestoring] = useState(false);

  const scrollTop = useRecoilComponentValue(
    scrollWrapperScrollTopComponentState,
    componentInstanceId,
  );

  const restoreScrollPosition = useCallback(
    (position: number, elementId: string) => {
      const attemptRestore = () => {
        const element = document.getElementById(elementId);

        if (!isDefined(element)) {
          requestAnimationFrame(attemptRestore);
          return;
        }

        const isScrollable = element.scrollHeight > element.clientHeight;
        if (!isScrollable) {
          requestAnimationFrame(attemptRestore);
          return;
        }

        element.scrollTo({ top: position });

        requestAnimationFrame(() => {
          setIsRestoring(false);
        });
      };

      requestAnimationFrame(attemptRestore);
    },
    [],
  );

  useEffect(() => {
    if (isRestoring) return;

    if (scrollTop <= SCROLL_RESTORATION_TOP_THRESHOLD_PX) {
      sessionStorage.removeItem(storageKey);
      return;
    }

    sessionStorage.setItem(storageKey, scrollTop.toString());
  }, [scrollTop, storageKey, isRestoring]);

  useEffect(() => {
    const savedPosition = sessionStorage.getItem(storageKey);
    const expectedElementId = `scroll-wrapper-${componentInstanceId}`;

    if (!isDefined(savedPosition)) {
      return;
    }

    const position = parseInt(savedPosition, 10);

    if (position <= 0) {
      return;
    }

    setIsRestoring(true);
    restoreScrollPosition(position, expectedElementId);
  }, [
    location.pathname,
    storageKey,
    componentInstanceId,
    restoreScrollPosition,
  ]);
};
