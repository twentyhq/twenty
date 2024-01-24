import { useEffect } from 'react';
import debounce from 'lodash.debounce';
import { useRecoilCallback } from 'recoil';

import { scrollLeftState } from '@/ui/utilities/scroll/states/scrollLeftState';
import { scrollTopState } from '@/ui/utilities/scroll/states/scrollTopState';

import { isScrollingState } from '../states/isScrollingState';

export const useListenScroll = <T extends Element>({
  scrollableRef,
}: {
  scrollableRef: React.RefObject<T>;
}) => {
  const hideScrollBarsCallback = useRecoilCallback(({ snapshot }) => () => {
    const isScrolling = snapshot.getLoadable(isScrollingState).getValue();

    if (!isScrolling) {
      scrollableRef.current?.classList.remove('scrolling');
    }
  });

  const handleScrollStart = useRecoilCallback(({ set }) => (event: Event) => {
    set(isScrollingState, true);
    scrollableRef.current?.classList.add('scrolling');

    const target = event.target as HTMLElement;

    set(scrollTopState, target.scrollTop);
    set(scrollLeftState, target.scrollLeft);
  });

  const handleScrollEnd = useRecoilCallback(({ set }) => () => {
    set(isScrollingState, false);
    debounce(hideScrollBarsCallback, 1000)();
  });

  useEffect(() => {
    const refTarget = scrollableRef.current;

    refTarget?.addEventListener('scrollend', handleScrollEnd);
    refTarget?.addEventListener('scroll', handleScrollStart);

    return () => {
      refTarget?.removeEventListener('scrollend', handleScrollEnd);
      refTarget?.removeEventListener('scroll', handleScrollStart);
    };
  }, [
    hideScrollBarsCallback,
    handleScrollStart,
    handleScrollEnd,
    scrollableRef,
  ]);
};
