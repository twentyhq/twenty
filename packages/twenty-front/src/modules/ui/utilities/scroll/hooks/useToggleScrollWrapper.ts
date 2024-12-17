import { scrollWrapperInstanceComponentState } from '@/ui/utilities/scroll/states/scrollWrapperInstanceComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const useToggleScrollWrapper = () => {
  const instanceOverlay = useRecoilComponentValueV2(
    scrollWrapperInstanceComponentState,
  );

  const toggleScrollXWrapper = (isEnabled: boolean) => {
    if (!instanceOverlay) {
      return;
    }

    instanceOverlay.options({
      overflow: {
        x: isEnabled ? 'scroll' : 'hidden',
      },
    });
  };

  const toggleScrollYWrapper = (isEnabled: boolean) => {
    if (!instanceOverlay) {
      return;
    }

    instanceOverlay.options({
      overflow: {
        y: isEnabled ? 'scroll' : 'hidden',
      },
    });
  };

  return { toggleScrollXWrapper, toggleScrollYWrapper };
};
