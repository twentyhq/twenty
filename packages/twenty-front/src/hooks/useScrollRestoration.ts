import { useContext, useEffect } from 'react';
import { useLocation, useNavigation } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';

import { ScrollWrapperContext } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { scrollPositionState } from '@/ui/utilities/scroll/states/scrollPositionState';
import { scrollTopState } from '@/ui/utilities/scroll/states/scrollTopState';
import { isDefined } from '~/utils/isDefined';

/**
 * Note that `location.key` is used in the cache key, not `location.pathname`,
 * so the same path navigated to at different points in the history stack will
 * not share the same scroll position.
 */
export const useScrollRestoration = () => {
  const key = `scroll-position-${useLocation().key}`;
  const { state } = useNavigation();

  const [scrollPosition, setScrollPosition] = useRecoilState(
    scrollPositionState(key),
  );

  const scrollTop = useRecoilValue(scrollTopState); // Ensure Recoil state is initialized

  const { instance: scrollbarInstance } = useContext(ScrollWrapperContext);

  const scrollWrapper = scrollbarInstance?.()?.elements().viewport;

  useEffect(() => {
    if (state === 'loading') {
      setScrollPosition(scrollTop ?? 0);
    } else if (state === 'idle' && isDefined(scrollWrapper)) {
      scrollWrapper.scrollTo({ top: scrollPosition });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, state, scrollWrapper]);
};
