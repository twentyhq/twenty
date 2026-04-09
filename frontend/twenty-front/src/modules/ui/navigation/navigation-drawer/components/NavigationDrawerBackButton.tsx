import { styled } from '@linaria/react';

import { currentMobileNavigationDrawerState } from '@/navigation/states/currentMobileNavigationDrawerState';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { navigationDrawerExpandedMemorizedState } from '@/ui/navigation/states/navigationDrawerExpandedMemorizedState';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useIsWorkspaceActivationStatusEqualsTo } from '@/workspace/hooks/useIsWorkspaceActivationStatusEqualsTo';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { useContext } from 'react';
import { IconX } from 'twenty-ui/display';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

type NavigationDrawerBackButtonProps = {
  title: string;
};

const StyledIconAndButtonContainer = styled.button`
  align-items: center;
  background: inherit;
  border: none;
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: flex;
  flex-direction: row;
  font-family: ${themeCssVariables.font.family};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing['1.5']} ${themeCssVariables.spacing[1]};
  width: 100%;
  &:hover {
    background: ${themeCssVariables.background.transparent.light};
    border-radius: ${themeCssVariables.border.radius.sm};
  }
`;

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  height: ${themeCssVariables.spacing[8]};
  justify-content: space-between;
  padding-left: ${themeCssVariables.spacing[5]};
`;

export const NavigationDrawerBackButton = ({
  title,
}: NavigationDrawerBackButtonProps) => {
  const { theme } = useContext(ThemeContext);
  const navigationMemorizedUrl = useAtomStateValue(navigationMemorizedUrlState);

  const setIsNavigationDrawerExpanded = useSetAtomState(
    isNavigationDrawerExpandedState,
  );
  const setCurrentMobileNavigationDrawer = useSetAtomState(
    currentMobileNavigationDrawerState,
  );
  const navigationDrawerExpandedMemorized = useAtomStateValue(
    navigationDrawerExpandedMemorizedState,
  );

  const isWorkspaceSuspended = useIsWorkspaceActivationStatusEqualsTo(
    WorkspaceActivationStatus.SUSPENDED,
  );

  if (isWorkspaceSuspended) {
    return <StyledContainer />;
  }

  return (
    <StyledContainer>
      <UndecoratedLink
        to={navigationMemorizedUrl}
        replace
        onClick={() => {
          setIsNavigationDrawerExpanded(navigationDrawerExpandedMemorized);
          setCurrentMobileNavigationDrawer('main');
        }}
      >
        <StyledIconAndButtonContainer>
          <IconX
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.lg}
            color={theme.font.color.tertiary}
          />
          <span>{title}</span>
        </StyledIconAndButtonContainer>
      </UndecoratedLink>
    </StyledContainer>
  );
};
