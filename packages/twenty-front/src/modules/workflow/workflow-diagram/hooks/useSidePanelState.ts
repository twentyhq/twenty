import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { type SidePanelAnimationVariant } from '@/side-panel/types/SidePanelAnimationVariant';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsMobile } from 'twenty-ui/utilities';

export const useSidePanelState = (): {
  sidePanelState: SidePanelAnimationVariant;
} => {
  const isMobile = useIsMobile();
  const isSidePanelOpened = useAtomStateValue(isSidePanelOpenedState);

  if (isMobile) {
    return {
      sidePanelState: 'fullScreen',
    };
  }

  return {
    sidePanelState: isSidePanelOpened ? 'normal' : 'closed',
  };
};
