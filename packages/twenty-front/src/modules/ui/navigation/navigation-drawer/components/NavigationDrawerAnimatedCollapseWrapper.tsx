import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { useIsNavigationDrawerContentExpanded } from '@/navigation/hooks/useIsNavigationDrawerContentExpanded';
import { styled } from '@linaria/react';
import {
  type AnimationControls,
  motion,
  type TargetAndTransition,
} from 'framer-motion';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';
const StyledAnimatedContainerBase = styled.span`
  display: block;
`;

const StyledAnimatedContainer = motion.create(StyledAnimatedContainerBase);

export const NavigationDrawerAnimatedCollapseWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { theme } = useContext(ThemeContext);
  const isSettingsPage = useIsSettingsPage();
  const isNavigationDrawerExpanded = useIsNavigationDrawerContentExpanded();

  const shouldShowContent = isSettingsPage || isNavigationDrawerExpanded;

  const animate: AnimationControls | TargetAndTransition = shouldShowContent
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
      transition={{
        duration: theme.animation.duration.normal,
      }}
    >
      {children}
    </StyledAnimatedContainer>
  );
};
