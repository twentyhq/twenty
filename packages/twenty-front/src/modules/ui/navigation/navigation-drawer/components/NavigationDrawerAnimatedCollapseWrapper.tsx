import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  type AnimationControls,
  motion,
  type TargetAndTransition,
} from 'framer-motion';
import { useRecoilValue } from 'recoil';

const StyledAnimatedContainer = styled(motion.span)`
  display: block;
`;

export const NavigationDrawerAnimatedCollapseWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const theme = useTheme();
  const isSettingsPage = useIsSettingsPage();
  const isNavigationDrawerExpanded = useRecoilValue(
    isNavigationDrawerExpandedState,
  );

  if (isSettingsPage) {
    return children;
  }

  const animate: AnimationControls | TargetAndTransition =
    isNavigationDrawerExpanded
      ? {
          opacity: 1,
          width: 'auto',
          height: 'auto',
          pointerEvents: 'auto',
        }
      : {
          opacity: 0,
          width: 0,
          height: 0,
          pointerEvents: 'none',
        };

  return (
    <StyledAnimatedContainer
      initial={false}
      animate={animate}
      transition={{ duration: theme.animation.duration.normal }}
    >
      {children}
    </StyledAnimatedContainer>
  );
};
