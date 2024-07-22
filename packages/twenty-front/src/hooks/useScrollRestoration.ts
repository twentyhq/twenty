import { useEffect } from 'react';
import { useLocation, useNavigation } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';

import { overlayScrollbarsState } from '@/ui/utilities/scroll/states/overlayScrollbarsState';
import { scrollPositionState } from '@/ui/utilities/scroll/states/scrollPositionState';
import { isDefined } from '~/utils/isDefined';

/**
 * @deprecated We should now use useScrollToPosition instead
 * Note that `location.key` is used in the cache key, not `location.pathname`,
 * so the same path navigated to at different points in the history stack will
 * not share the same scroll position.
 */
export const useScrollRestoration = (viewportHeight?: number) => {
  const key = `scroll-position-${useLocation().key}`;
  const { state } = useNavigation();

  const [scrollPosition, setScrollPosition] = useRecoilState(
    scrollPositionState(key),
  );

  const overlayScrollbars = useRecoilValue(overlayScrollbarsState);

  const scrollWrapper = overlayScrollbars?.elements().viewport;
  const skip = isDefined(viewportHeight) && scrollPosition > viewportHeight;

  useEffect(() => {
    if (state === 'loading') {
      setScrollPosition(scrollWrapper?.scrollTop ?? 0);
    } else if (state === 'idle' && isDefined(scrollWrapper) && !skip) {
      scrollWrapper.scrollTo({ top: scrollPosition });
    }
  }, [key, state, scrollWrapper, skip, scrollPosition, setScrollPosition]);
};
