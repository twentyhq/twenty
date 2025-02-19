import { scrollWrapperInstanceComponentState } from '@/ui/utilities/scroll/states/scrollWrapperInstanceComponentState';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useRecoilCallback } from 'recoil';

export const useScrollToPosition = () => {
  const scrollWrapperInstanceState = useRecoilComponentCallbackStateV2(
    scrollWrapperInstanceComponentState,
  );

  const scrollToPosition = useRecoilCallback(
    ({ snapshot }) =>
      (scrollPositionInPx: number) => {
        const overlayScrollbars = snapshot
          .getLoadable(scrollWrapperInstanceState)
          .getValue();

        const scrollWrapper = overlayScrollbars?.elements().viewport;

        scrollWrapper?.scrollTo({ top: scrollPositionInPx });
      },
    [scrollWrapperInstanceState],
  );

  return { scrollToPosition };
};
