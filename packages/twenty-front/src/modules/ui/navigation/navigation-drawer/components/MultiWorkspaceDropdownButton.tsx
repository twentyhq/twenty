import { useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { IconChevronDown } from 'twenty-ui';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { Workspaces } from '@/auth/states/workspaces';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItemSelectAvatar } from '@/ui/navigation/menu-item/components/MenuItemSelectAvatar';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import { MULTI_WORKSPACE_DROPDOWN_ID } from '@/ui/navigation/navigation-drawer/constants/MulitWorkspaceDropdownId';
import { useWorkspaceSwitching } from '@/ui/navigation/navigation-drawer/hooks/useWorkspaceSwitching';
import { NavigationDrawerHotKeyScope } from '@/ui/navigation/navigation-drawer/types/NavigationDrawerHotKeyScope';
import { getImageAbsoluteURIOrBase64 } from '~/utils/image/getImageAbsoluteURIOrBase64';

const StyledLogo = styled.div<{ logo: string }>`
  background: url(${({ logo }) => logo});
  background-position: center;
  background-size: cover;
  border-radius: ${({ theme }) => theme.border.radius.xs};
  height: 16px;
  width: 16px;
`;

const StyledContainer = styled.div`
  align-items: center;
  cursor: pointer;
  color: ${({ theme }) => theme.font.color.primary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border: 1px solid transparent;
  display: flex;
  justify-content: space-between;
  height: ${({ theme }) => theme.spacing(5)};
  padding: calc(${({ theme }) => theme.spacing(1)} - 1px);
  width: 100%;

  gap: ${({ theme }) => theme.spacing(1)};

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
  color: ${({ disabled, theme }) =>
    disabled ? theme.font.color.extraLight : theme.font.color.tertiary};
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

  const { closeDropdown } = useDropdown(MULTI_WORKSPACE_DROPDOWN_ID);

  const handleChange = async (workspaceId: string) => {
    setToggleMultiWorkspaceDropdown(!isMultiWorkspaceDropdownOpen);
    closeDropdown();
    await switchWorkspace(workspaceId);
  };

  return (
    <Dropdown
      dropdownId={MULTI_WORKSPACE_DROPDOWN_ID}
      dropdownHotkeyScope={{
        scope: NavigationDrawerHotKeyScope.MultiWorkspaceDropdownButton,
      }}
      clickableComponent={
        <StyledContainer>
          <StyledLogo
            logo={
              getImageAbsoluteURIOrBase64(
                currentWorkspace?.logo === null
                  ? DEFAULT_WORKSPACE_LOGO
                  : currentWorkspace?.logo,
              ) ?? ''
            }
          />
          <StyledLabel>{currentWorkspace?.displayName ?? ''}</StyledLabel>
          <StyledIconChevronDown
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
          />
        </StyledContainer>
      }
      dropdownComponents={
        <DropdownMenuItemsContainer>
          {workspaces.map((workspace) => (
            <MenuItemSelectAvatar
              key={workspace.id}
              text={workspace.displayName ?? ''}
              avatar={
                <StyledLogo
                  logo={
                    getImageAbsoluteURIOrBase64(
                      workspace.logo === null
                        ? DEFAULT_WORKSPACE_LOGO
                        : workspace.logo,
                    ) ?? ''
                  }
                />
              }
              selected={currentWorkspace?.id === workspace.id}
              onClick={() => handleChange(workspace.id)}
            />
          ))}
        </DropdownMenuItemsContainer>
      }
    />
  );
};
