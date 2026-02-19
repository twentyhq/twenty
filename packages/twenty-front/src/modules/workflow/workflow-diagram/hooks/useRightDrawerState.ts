import { isCommandMenuOpenedStateV2 } from '@/command-menu/states/isCommandMenuOpenedStateV2';
import { type CommandMenuAnimationVariant } from '@/command-menu/types/CommandMenuAnimationVariant';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { useIsMobile } from 'twenty-ui/utilities';

export const useRightDrawerState = (): {
  rightDrawerState: CommandMenuAnimationVariant;
} => {
  const isMobile = useIsMobile();
  const isCommandMenuOpened = useRecoilValueV2(isCommandMenuOpenedStateV2);

  if (isMobile) {
    return {
      rightDrawerState: 'fullScreen',
    };
  }

  return {
    rightDrawerState: isCommandMenuOpened ? 'normal' : 'closed',
  };
};
