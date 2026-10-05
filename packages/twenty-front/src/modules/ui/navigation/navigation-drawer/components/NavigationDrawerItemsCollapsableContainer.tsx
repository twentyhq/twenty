import { NAVIGATION_DRAWER_COLLAPSED_BUTTON_SIZE } from '@/ui/navigation/navigation-drawer/constants/NavigationDrawerCollapsedButtonSize';
import { useIsNavigationDrawerContentExpanded } from '@/navigation/hooks/useIsNavigationDrawerContentExpanded';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import {
  type AnimationControls,
  motion,
  type TargetAndTransition,
} from 'framer-motion';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

const StyledAnimationGroupContainerBase = styled.div<{
  isCollapsedGroup: boolean;
}>`
  background-color: ${({ isCollapsedGroup }) =>
    isCollapsedGroup
      ? themeCssVariables.background.transparent.lighter
      : 'transparent'};
  border: ${({ isCollapsedGroup }) =>
    isCollapsedGroup
      ? `1px solid ${themeCssVariables.background.transparent.lighter}`
      : 'none'};
  border-radius: ${({ isCollapsedGroup }) =>
    isCollapsedGroup ? themeCssVariables.border.radius.md : '0'};
  transition: background-color
    calc(${themeCssVariables.animation.duration.normal} * 1s) ease;
`;

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
  const theme = useTheme();
  const isExpanded = useIsNavigationDrawerContentExpanded();

  const animate: AnimationControls | TargetAndTransition = isExpanded
    ? { width: 'auto' }
    : { width: NAVIGATION_DRAWER_COLLAPSED_BUTTON_SIZE };

  return (
    <StyledAnimationGroupContainer
      isCollapsedGroup={isGroup && !isExpanded}
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
