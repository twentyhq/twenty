import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import {
  type AnimationControls,
  motion,
  type TargetAndTransition,
} from 'framer-motion';
import {
  resolveThemeVariable,
  themeCssVariables,
} from 'twenty-ui/theme-constants';
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
        backgroundColor: resolveThemeVariable(
          themeCssVariables.background.transparent.lighter,
        ),
        border: `1px solid ${resolveThemeVariable(themeCssVariables.background.transparent.lighter)}`,
        borderRadius: resolveThemeVariable(themeCssVariables.border.radius.sm),
      };
    }
  }

  return (
    <StyledAnimationGroupContainer
      initial={false}
      animate={animate}
      transition={{
        duration: resolveThemeVariable(
          themeCssVariables.animation.duration.normal,
        ),
      }}
    >
      {children}
    </StyledAnimationGroupContainer>
  );
};
