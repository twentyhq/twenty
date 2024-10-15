import styled from '@emotion/styled';
import { ReactNode } from 'react';
import { useRecoilValue } from 'recoil';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { AnimationControls, motion, TargetAndTransition } from 'framer-motion';
import { useTheme } from '@emotion/react';

const StyledAnimationGroupContainer = styled(motion.div)``;

type NavigationDrawerItemsCollapsedContainerProps = {
  isGroup?: boolean;
  children: ReactNode;
};

export const NavigationDrawerItemsCollapsedContainer = ({
  isGroup = false,
  children,
}: NavigationDrawerItemsCollapsedContainerProps) => {
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
