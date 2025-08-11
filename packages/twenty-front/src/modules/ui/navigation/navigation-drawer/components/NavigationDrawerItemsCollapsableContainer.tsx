import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  type AnimationControls,
  motion,
  type TargetAndTransition,
} from 'framer-motion';
import { type ReactNode } from 'react';
import { useRecoilValue } from 'recoil';

const StyledAnimationGroupContainer = styled(motion.div)``;

type NavigationDrawerItemsCollapsableContainerProps = {
  isGroup?: boolean;
  children: ReactNode;
};

export const NavigationDrawerItemsCollapsableContainer = ({
  isGroup = false,
  children,
}: NavigationDrawerItemsCollapsableContainerProps) => {
  const theme = useTheme();
  const isSettingsPage = useIsSettingsPage();
  const isNavigationDrawerExpanded = useRecoilValue(
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
      transition={{ duration: theme.animation.duration.normal }}
    >
      {children}
    </StyledAnimationGroupContainer>
  );
};
