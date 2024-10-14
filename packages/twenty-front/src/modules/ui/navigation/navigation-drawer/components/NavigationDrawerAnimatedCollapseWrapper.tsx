import styled from '@emotion/styled';
import { AnimationControls, motion, TargetAndTransition } from 'framer-motion';
import { useRecoilValue } from 'recoil';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useTheme } from '@emotion/react';
import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';

const StyledAnimatedContainer = styled(motion.div)`
  overflow: hidden;
`;

export const NavigationDrawerAnimatedCollapseWrapper = ({
  children,
  animateHeight = false,
}: {
  children: React.ReactNode;
  animateHeight?: boolean;
}) => {
  const theme = useTheme();
  const isSettingsPage = useIsSettingsPage();
  const isNavigationDrawerExpanded = useRecoilValue(
    isNavigationDrawerExpandedState,
  );

  if (isSettingsPage) {
    return children;
  }

  let animate: AnimationControls | TargetAndTransition = {};
  if (isNavigationDrawerExpanded) {
    animate = { opacity: 1, pointerEvents: 'auto' };
  } else {
    animate = {
      width: 0,
      opacity: 0,
      pointerEvents: 'none',
    };
    if (animateHeight) {
      animate = { ...animate, height: 0 };
    }
  }

  return (
    <StyledAnimatedContainer
      initial={false}
      animate={animate}
      transition={{
        duration: theme.animation.duration.normal,
      }}
    >
      {children}
    </StyledAnimatedContainer>
  );
};
