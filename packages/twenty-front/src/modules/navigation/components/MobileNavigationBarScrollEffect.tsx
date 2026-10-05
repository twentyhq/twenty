import { isMobileNavigationBarVisibleState } from '@/navigation/states/isMobileNavigationBarVisibleState';
import {
  getNextNavigationBarScrollState,
  INITIAL_NAVIGATION_BAR_SCROLL_STATE,
  type NavigationBarScrollState,
} from '@/navigation/utils/getNextNavigationBarScrollState';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const MobileNavigationBarScrollEffect = () => {
  const { pathname } = useLocation();
  const isSidePanelOpened = useAtomStateValue(isSidePanelOpenedState);
  const setIsMobileNavigationBarVisible = useSetAtomState(
    isMobileNavigationBarVisibleState,
  );

  // Capture phase sees every container's scrolls. Re-subscribing on navigation and side panel toggles resets the
  // accumulated direction, otherwise the next small scroll in the new view would cross the threshold on its own.
  useEffect(() => {
    setIsMobileNavigationBarVisible(true);

    const lastScrollTopByElement = new WeakMap<Element, number>();
    let scrollState: NavigationBarScrollState =
      INITIAL_NAVIGATION_BAR_SCROLL_STATE;

    const handleScroll = (event: Event) => {
      const scrolledElement = event.target;

      if (!(scrolledElement instanceof Element)) {
        return;
      }

      const scrollTopInPx = scrolledElement.scrollTop;
      const lastScrollTopInPx = lastScrollTopByElement.get(scrolledElement);
      lastScrollTopByElement.set(scrolledElement, scrollTopInPx);

      scrollState = getNextNavigationBarScrollState({
        scrollTopInPx,
        lastScrollTopInPx,
        currentState: scrollState,
      });

      setIsMobileNavigationBarVisible(scrollState.isVisible);
    };

    document.addEventListener('scroll', handleScroll, {
      capture: true,
      passive: true,
    });

    return () => {
      document.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, [pathname, isSidePanelOpened, setIsMobileNavigationBarVisible]);

  return <></>;
};
