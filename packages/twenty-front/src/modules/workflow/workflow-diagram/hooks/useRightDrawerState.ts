import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { CommandMenuAnimationVariant } from '@/command-menu/types/CommandMenuAnimationVariant';
import { isRightDrawerMinimizedState } from '@/ui/layout/right-drawer/states/isRightDrawerMinimizedState';
import { isRightDrawerOpenState } from '@/ui/layout/right-drawer/states/isRightDrawerOpenState';
import { RightDrawerAnimationVariant } from '@/ui/layout/right-drawer/types/RightDrawerAnimationVariant';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useRecoilValue } from 'recoil';
import { useIsMobile } from 'twenty-ui';
import { FeatureFlagKey } from '~/generated/graphql';

export const useRightDrawerState = (): {
  rightDrawerState: RightDrawerAnimationVariant | CommandMenuAnimationVariant;
} => {
  const isRightDrawerOpen = useRecoilValue(isRightDrawerOpenState);
  const isRightDrawerMinimized = useRecoilValue(isRightDrawerMinimizedState);
  const isMobile = useIsMobile();

  const isCommandMenuV2Enabled = useIsFeatureEnabled(
    FeatureFlagKey.IsCommandMenuV2Enabled,
  );

  const isCommandMenuOpened = useRecoilValue(isCommandMenuOpenedState);

  if (isMobile) {
    return {
      rightDrawerState: 'fullScreen',
    };
  }

  if (isCommandMenuV2Enabled) {
    return {
      rightDrawerState: isCommandMenuOpened ? 'normal' : 'closed',
    };
  }

  return {
    rightDrawerState: !isRightDrawerOpen
      ? 'closed'
      : isRightDrawerMinimized
        ? 'minimized'
        : 'normal',
  };
};
