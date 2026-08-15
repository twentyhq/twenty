import { isMobileNavigationBarVisibleState } from '@/navigation/states/isMobileNavigationBarVisibleState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SCROLL_DELTA_TO_TOGGLE_IN_PX = 24;
const SCROLL_TOP_ALWAYS_VISIBLE_IN_PX = 8;

// The app has many independent scroll containers, so rather than wiring each of
// them up we listen on the capture phase, where every scroll event passes
// through the document on its way down.
export const useHideMobileNavigationBarOnScrollDown = () => {
  const { pathname } = useLocation();
  const setIsMobileNavigationBarVisible = useSetAtomState(
    isMobileNavigationBarVisibleState,
  );

  useEffect(() => {
    setIsMobileNavigationBarVisible(true);
  }, [pathname, setIsMobileNavigationBarVisible]);

  useEffect(() => {
    const lastScrollTopByElement = new WeakMap<Element, number>();
    let accumulatedDeltaInPx = 0;

    const handleScroll = (event: Event) => {
      const scrolledElement = event.target;

      if (!(scrolledElement instanceof Element)) {
        return;
      }

      const scrollTop = scrolledElement.scrollTop;
      const lastScrollTop = lastScrollTopByElement.get(scrolledElement);
      lastScrollTopByElement.set(scrolledElement, scrollTop);

      // A container restoring its scroll position would otherwise read as a
      // jump down from 0 the first time we see it.
      if (lastScrollTop === undefined) {
        return;
      }

      const deltaInPx = scrollTop - lastScrollTop;

      if (deltaInPx === 0) {
        return;
      }

      if (scrollTop <= SCROLL_TOP_ALWAYS_VISIBLE_IN_PX) {
        accumulatedDeltaInPx = 0;
        setIsMobileNavigationBarVisible(true);
        return;
      }

      const hasDirectionChanged =
        Math.sign(accumulatedDeltaInPx) !== Math.sign(deltaInPx);

      accumulatedDeltaInPx = hasDirectionChanged
        ? deltaInPx
        : accumulatedDeltaInPx + deltaInPx;

      if (accumulatedDeltaInPx > SCROLL_DELTA_TO_TOGGLE_IN_PX) {
        setIsMobileNavigationBarVisible(false);
      } else if (accumulatedDeltaInPx < -SCROLL_DELTA_TO_TOGGLE_IN_PX) {
        setIsMobileNavigationBarVisible(true);
      }
    };

    document.addEventListener('scroll', handleScroll, {
      capture: true,
      passive: true,
    });

    return () => {
      document.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, [setIsMobileNavigationBarVisible]);
};
