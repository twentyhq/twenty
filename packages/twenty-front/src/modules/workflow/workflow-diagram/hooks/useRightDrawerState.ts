import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { CommandMenuAnimationVariant } from '@/command-menu/types/CommandMenuAnimationVariant';
import { RightDrawerAnimationVariant } from '@/ui/layout/right-drawer/types/RightDrawerAnimationVariant';
import { useRecoilValue } from 'recoil';
import { useIsMobile } from 'twenty-ui';

export const useRightDrawerState = (): {
  rightDrawerState: RightDrawerAnimationVariant | CommandMenuAnimationVariant;
} => {
  const isMobile = useIsMobile();
  const isCommandMenuOpened = useRecoilValue(isCommandMenuOpenedState);

  if (isMobile) {
    return {
      rightDrawerState: 'fullScreen',
    };
  }

  return {
    rightDrawerState: isCommandMenuOpened ? 'normal' : 'closed',
  };
};
