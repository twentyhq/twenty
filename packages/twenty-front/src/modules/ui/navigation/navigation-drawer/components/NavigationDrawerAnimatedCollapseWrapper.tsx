import { useIsNavigationDrawerContentExpanded } from '@/navigation/hooks/useIsNavigationDrawerContentExpanded';
import { styled } from '@linaria/react';
import {
  type AnimationControls,
  motion,
  type TargetAndTransition,
} from 'framer-motion';
import { useTheme } from 'twenty-ui/theme';
const StyledAnimatedContainerBase = styled.span`
  display: block;
`;

const StyledAnimatedContainer = motion.create(StyledAnimatedContainerBase);

export const NavigationDrawerAnimatedCollapseWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const theme = useTheme();
  const isNavigationDrawerExpanded = useIsNavigationDrawerContentExpanded();

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
      inert={!isNavigationDrawerExpanded || undefined}
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
