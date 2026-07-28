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
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const COLLAPSED_GROUP_WIDTH = 24;

// The group chrome is handled in CSS rather than through the animate object:
// framer-motion cannot animate the `border` shorthand to `none`, which would
// leave the collapsed border painted once the drawer is expanded.
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
  const { theme } = useContext(ThemeContext);
  const isSettingsPage = useIsSettingsPage();
  const isNavigationDrawerExpanded = useAtomStateValue(
    isNavigationDrawerExpandedState,
  );
  const isExpanded = isNavigationDrawerExpanded || isSettingsPage;

  const animate: AnimationControls | TargetAndTransition = isExpanded
    ? { width: 'auto' }
    : { width: COLLAPSED_GROUP_WIDTH };

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
