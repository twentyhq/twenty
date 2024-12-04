import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { Workspaces } from '@/auth/states/workspaces';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import { MULTI_WORKSPACE_DROPDOWN_ID } from '@/ui/navigation/navigation-drawer/constants/MulitWorkspaceDropdownId';
import { useWorkspaceSwitching } from '@/ui/navigation/navigation-drawer/hooks/useWorkspaceSwitching';
import { NavigationDrawerHotKeyScope } from '@/ui/navigation/navigation-drawer/types/NavigationDrawerHotKeyScope';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { IconChevronDown, MenuItemSelectAvatar } from 'twenty-ui';
import { getImageAbsoluteURI } from '~/utils/image/getImageAbsoluteURI';
import { Link } from 'react-router-dom';
import { useUrlManager } from '@/url-manager/hooks/useUrlManager';

const StyledLink = styled(Link)`
  text-decoration: none;
  width: 100%;
`;

const StyledLogo = styled.div<{ logo: string }>`
  background: url(${({ logo }) => logo});
  background-position: center;
  background-size: cover;
  border-radius: ${({ theme }) => theme.border.radius.xs};
  height: 16px;
  width: 16px;
`;

const StyledContainer = styled.div<{ isNavigationDrawerExpanded: boolean }>`
  align-items: center;
  cursor: pointer;
  color: ${({ theme }) => theme.font.color.primary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border: 1px solid transparent;
  display: flex;
  justify-content: space-between;
  height: ${({ theme, isNavigationDrawerExpanded }) =>
    isNavigationDrawerExpanded ? theme.spacing(5) : theme.spacing(4)};
  padding: calc(${({ theme }) => theme.spacing(1)} - 1px);
  width: ${({ isNavigationDrawerExpanded }) =>
    isNavigationDrawerExpanded ? '100%' : 'auto'};
  gap: ${({ theme, isNavigationDrawerExpanded }) =>
    isNavigationDrawerExpanded ? theme.spacing(1) : '0'};
  &:hover {
    background-color: ${({ theme }) => theme.background.transparent.lighter};
    border: 1px solid ${({ theme }) => theme.border.color.medium};
  }
`;

const StyledLabel = styled.div`
  align-items: center;
  display: flex;
`;

const StyledIconChevronDown = styled(IconChevronDown)<{ disabled?: boolean }>`
  align-items: center;
  color: ${({ disabled, theme }) =>
    disabled ? theme.font.color.extraLight : theme.font.color.tertiary};
  display: flex;
`;

type MultiWorkspaceDropdownButtonProps = {
  workspaces: Workspaces[];
};

export const MultiWorkspaceDropdownButton = ({
  workspaces,
}: MultiWorkspaceDropdownButtonProps) => {
  const theme = useTheme();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const [isMultiWorkspaceDropdownOpen, setToggleMultiWorkspaceDropdown] =
    useState(false);

  const { switchWorkspace } = useWorkspaceSwitching();
  const { buildWorkspaceUrl } = useUrlManager();

  const { closeDropdown } = useDropdown(MULTI_WORKSPACE_DROPDOWN_ID);

  const handleChange = async (workspaceId: string) => {
    setToggleMultiWorkspaceDropdown(!isMultiWorkspaceDropdownOpen);
    closeDropdown();
    await switchWorkspace(workspaceId);
  };
  const [isNavigationDrawerExpanded] = useRecoilState(
    isNavigationDrawerExpandedState,
  );

  return (
    <Dropdown
      dropdownId={MULTI_WORKSPACE_DROPDOWN_ID}
      dropdownHotkeyScope={{
        scope: NavigationDrawerHotKeyScope.MultiWorkspaceDropdownButton,
      }}
      clickableComponent={
        <StyledContainer
          data-testid="workspace-dropdown"
          isNavigationDrawerExpanded={isNavigationDrawerExpanded}
        >
          <StyledLogo
            logo={getImageAbsoluteURI(
              currentWorkspace?.logo ?? DEFAULT_WORKSPACE_LOGO,
            )}
          />
          <NavigationDrawerAnimatedCollapseWrapper>
            <StyledLabel>{currentWorkspace?.displayName ?? ''}</StyledLabel>
          </NavigationDrawerAnimatedCollapseWrapper>
          <NavigationDrawerAnimatedCollapseWrapper>
            <StyledIconChevronDown
              size={theme.icon.size.md}
              stroke={theme.icon.stroke.sm}
            />
          </NavigationDrawerAnimatedCollapseWrapper>
        </StyledContainer>
      }
      dropdownComponents={
        <DropdownMenuItemsContainer>
          {workspaces.map((workspace) => (
            <StyledLink
              key={workspace.id}
              to={buildWorkspaceUrl(workspace.subdomain)}
            >
              <MenuItemSelectAvatar
                text={workspace.displayName ?? ''}
                avatar={
                  <StyledLogo
                    logo={getImageAbsoluteURI(
                      workspace.logo ?? DEFAULT_WORKSPACE_LOGO,
                    )}
                  />
                }
                selected={currentWorkspace?.id === workspace.id}
                onClick={(event) => {
                  event?.preventDefault();
                  handleChange(workspace.id);
                }}
              />
            </StyledLink>
          ))}
        </DropdownMenuItemsContainer>
      }
    />
  );
};
