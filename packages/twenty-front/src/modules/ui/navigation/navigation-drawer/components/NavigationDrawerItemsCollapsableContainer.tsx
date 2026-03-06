import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { type ReactNode, useContext } from 'react';
import {
  type AnimationControls,
  motion,
  type TargetAndTransition,
} from 'framer-motion';
import { ThemeContext } from 'twenty-ui/theme-constants';
const StyledAnimationGroupContainerBase = styled.div``;

const StyledAnimationGroupContainer = motion.create(
  StyledAnimationGroupContainerBase,
);

type NavigationDrawerItemsCollapsableContainerProps = {
  isGroup?: boolean;
  children: ReactNode;
};

export const NavigationDrawerItemsCollapsableContainer = ({
  isGroup = false,
  children,
}: NavigationDrawerItemsCollapsableContainerProps) => {
  const { theme } = useContext(ThemeContext);
  const isSettingsPage = useIsSettingsPage();
  const isNavigationDrawerExpanded = useAtomStateValue(
    isNavigationDrawerExpandedState,
  );
  const isExpanded = isNavigationDrawerExpanded || isSettingsPage;
  let animate: AnimationControls | TargetAndTransition = {
    width: 'auto',
    backgroundColor: 'transparent',
    border: 'none',
  };
  if (!isExpanded) {
    animate = { width: 24 };
    if (isGroup) {
      animate = {
        width: 24,
        backgroundColor: theme.background.transparent.lighter,
        border: `1px solid ${theme.background.transparent.lighter}`,
        borderRadius: theme.border.radius.sm,
      };
    }
  }

  return (
    <StyledAnimationGroupContainer
      initial={false}
      animate={animate}
      transition={{
        duration: theme.animation.duration.normal,
      }}
    >
      {children}
    </StyledAnimationGroupContainer>
  );
};
