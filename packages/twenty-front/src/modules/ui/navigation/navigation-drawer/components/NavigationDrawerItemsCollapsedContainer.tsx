import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { AnimationControls, motion, TargetAndTransition } from 'framer-motion';
import { ReactNode } from 'react';
import { useRecoilValue } from 'recoil';

const StyledAnimationGroupContainer = styled(motion.div)`
  align-items: ${() => (useIsMobile() ? 'center' : '')};
  display: flex;
  flex-direction: ${() => (useIsMobile() ? 'row' : 'column')};
`;

type NavigationDrawerItemsCollapsedContainerProps = {
  isGroup?: boolean;
  children: ReactNode;
  mobileNavigationDrawer?: boolean;
};

export const NavigationDrawerItemsCollapsedContainer = ({
  mobileNavigationDrawer,
  isGroup = false,
  children,
}: NavigationDrawerItemsCollapsedContainerProps) => {
  const theme = useTheme();
  const isSettingsPage = useIsSettingsPage();
  const isNavigationDrawerExpanded = useRecoilValue(
    isNavigationDrawerExpandedState,
  );
  const isMobile = useIsMobile();
  const isExpanded = isNavigationDrawerExpanded || isSettingsPage;
  let animate: AnimationControls | TargetAndTransition = {
    width: 'auto',
    backgroundColor: 'transparent',
    border: 'none',
  };
  if (!isExpanded) {
    animate = { width: isMobile ? '100%' : 24 };
    if (isGroup) {
      animate = {
        width: isMobile ? '100%' : 24,
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
