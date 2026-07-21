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
import { IconX } from 'twenty-ui/icon';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

type NavigationDrawerBackButtonProps = {
  title: string;
};

const StyledIconAndButtonContainer = styled.button`
  align-items: center;
  background: inherit;
  border: 1px solid transparent;
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  display: flex;
  flex-direction: row;
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[2]};
  height: ${themeCssVariables.spacing[7]};
  padding: 2px ${themeCssVariables.spacing[1]} 2px 2px;
  width: fit-content;
  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }
`;

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  height: ${themeCssVariables.spacing[8]};
  justify-content: space-between;
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
            stroke={theme.icon.stroke.sm}
            color={theme.font.color.secondary}
          />
          <span>{title}</span>
        </StyledIconAndButtonContainer>
      </UndecoratedLink>
    </StyledContainer>
  );
};
