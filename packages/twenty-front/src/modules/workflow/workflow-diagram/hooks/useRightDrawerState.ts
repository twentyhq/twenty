import { isCommandMenuOpenedStateV2 } from '@/command-menu/states/isCommandMenuOpenedStateV2';
import { type CommandMenuAnimationVariant } from '@/command-menu/types/CommandMenuAnimationVariant';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';
import { useIsMobile } from 'twenty-ui/utilities';

export const useRightDrawerState = (): {
  rightDrawerState: CommandMenuAnimationVariant;
} => {
  const isMobile = useIsMobile();
  const isCommandMenuOpened = useAtomValue(isCommandMenuOpenedStateV2);

  if (isMobile) {
    return {
      rightDrawerState: 'fullScreen',
    };
  }

  return {
    rightDrawerState: isCommandMenuOpened ? 'normal' : 'closed',
  };
};
