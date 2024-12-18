import { useEffect } from 'react';
import { useNavigation } from 'react-router-dom';

import { scrollWrapperInstanceComponentState } from '@/ui/utilities/scroll/states/scrollWrapperInstanceComponentState';
import { scrollWrapperScrollTopComponentState } from '@/ui/utilities/scroll/states/scrollWrapperScrollTopComponentState';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isDefined } from '~/utils/isDefined';

/**
 * @deprecated We should now use useScrollToPosition instead
 * Note that `location.key` is used in the cache key, not `location.pathname`,
 * so the same path navigated to at different points in the history stack will
 * not share the same scroll position.
 */
export const useScrollRestoration = (viewportHeight?: number) => {
  const { state } = useNavigation();

  const [scrollTop, setScrollTop] = useRecoilComponentStateV2(
    scrollWrapperScrollTopComponentState,
  );

  const overlayScrollbars = useRecoilComponentValueV2(
    scrollWrapperInstanceComponentState,
  );

  const scrollWrapper = overlayScrollbars?.elements().viewport;
  const skip = isDefined(viewportHeight) && scrollTop > viewportHeight;

  useEffect(() => {
    if (state === 'loading') {
      setScrollTop(scrollWrapper?.scrollTop ?? 0);
    } else if (state === 'idle' && isDefined(scrollWrapper) && !skip) {
      scrollWrapper.scrollTo({ top: scrollTop });
    }
  }, [state, scrollWrapper, skip, scrollTop, setScrollTop]);
};
