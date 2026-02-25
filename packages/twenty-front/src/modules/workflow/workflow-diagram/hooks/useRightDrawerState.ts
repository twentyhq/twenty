import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { type CommandMenuAnimationVariant } from '@/command-menu/types/CommandMenuAnimationVariant';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsMobile } from 'twenty-ui/utilities';

export const useRightDrawerState = (): {
  rightDrawerState: CommandMenuAnimationVariant;
} => {
  const isMobile = useIsMobile();
  const isCommandMenuOpened = useAtomStateValue(isCommandMenuOpenedState);

  if (isMobile) {
    return {
      rightDrawerState: 'fullScreen',
    };
  }

  return {
    rightDrawerState: isCommandMenuOpened ? 'normal' : 'closed',
  };
};
