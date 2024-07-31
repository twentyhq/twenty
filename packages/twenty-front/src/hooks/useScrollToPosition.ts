import { overlayScrollbarsState } from '@/ui/utilities/scroll/states/overlayScrollbarsState';
import { useRecoilCallback } from 'recoil';

export const useScrollToPosition = () => {
  const scrollToPosition = useRecoilCallback(
    ({ snapshot }) =>
      (scrollPositionInPx: number) => {
        const overlayScrollbars = snapshot
          .getLoadable(overlayScrollbarsState)
          .getValue();

        const scrollWrapper = overlayScrollbars?.elements().viewport;

        scrollWrapper?.scrollTo({ top: scrollPositionInPx });
      },
    [],
  );

  return { scrollToPosition };
};
