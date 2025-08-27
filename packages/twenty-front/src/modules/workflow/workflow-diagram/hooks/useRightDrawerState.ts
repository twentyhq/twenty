import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { type CommandMenuAnimationVariant } from '@/command-menu/types/CommandMenuAnimationVariant';
import { useRecoilValue } from 'recoil';
import { useIsMobile } from 'twenty-ui/utilities';

export const useRightDrawerState = (): {
  rightDrawerState: CommandMenuAnimationVariant;
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
