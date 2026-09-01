import { SCROLL_RESTORATION_TOP_THRESHOLD_PX } from '@/ui/utilities/scroll/constants/ScrollRestorationTopThreshold';
import { scrollWrapperScrollTopComponentState } from '@/ui/utilities/scroll/states/scrollWrapperScrollTopComponentState';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

export const useScrollRestoration = (componentInstanceId: string) => {
  const location = useLocation();
  const workspaceSurface = useWorkspaceSurface();
  const scopedComponentInstanceId =
    useWorkspaceSurfaceScopedComponentInstanceId(componentInstanceId);
  const storageKey = `scroll-${workspaceSurface.type}-${location.pathname}-${componentInstanceId}`;
  const [isRestoring, setIsRestoring] = useState(false);

  const scrollWrapperScrollTop = useAtomComponentStateValue(
    scrollWrapperScrollTopComponentState,
    scopedComponentInstanceId,
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

    if (scrollWrapperScrollTop <= SCROLL_RESTORATION_TOP_THRESHOLD_PX) {
      sessionStorage.removeItem(storageKey);
      return;
    }

    sessionStorage.setItem(storageKey, scrollWrapperScrollTop.toString());
  }, [scrollWrapperScrollTop, storageKey, isRestoring]);

  useEffect(() => {
    const savedPosition = sessionStorage.getItem(storageKey);
    const expectedElementId = `scroll-wrapper-${scopedComponentInstanceId}`;

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
    scopedComponentInstanceId,
    restoreScrollPosition,
  ]);
};
