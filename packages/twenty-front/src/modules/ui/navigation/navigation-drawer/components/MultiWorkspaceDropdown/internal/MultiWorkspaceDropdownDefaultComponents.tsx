import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';

import { useAuth } from '@/auth/hooks/useAuth';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { Workspaces, workspacesState } from '@/auth/states/workspaces';
import { useBuildWorkspaceUrl } from '@/domain-manager/hooks/useBuildWorkspaceUrl';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SelectHotkeyScope } from '@/ui/input/types/SelectHotkeyScope';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MULTI_WORKSPACE_DROPDOWN_ID } from '@/ui/navigation/navigation-drawer/constants/MultiWorkspaceDropdownId';
import { multiWorkspaceDropdownState } from '@/ui/navigation/navigation-drawer/states/multiWorkspaceDropdownState';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import {
  Avatar,
  IconDotsVertical,
  IconLogout,
  IconPlus,
  IconSwitchHorizontal,
  IconUserPlus,
} from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import {
  MenuItem,
  MenuItemSelectAvatar,
  UndecoratedLink,
} from 'twenty-ui/navigation';
import { useSignUpInNewWorkspaceMutation } from '~/generated/graphql';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledDescription = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  padding-left: ${({ theme }) => theme.spacing(1)};
`;

const StyledDropdownMenuItemsContainer = styled.div`
  margin: ${({ theme }) => theme.spacing(1)} 0;
  padding: 0 ${({ theme }) => theme.spacing(1)};
`;

export const MultiWorkspaceDropdownDefaultComponents = () => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const { t } = useLingui();
  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();
  const workspaces = useRecoilValue(workspacesState);
  const { buildWorkspaceUrl } = useBuildWorkspaceUrl();
  const { closeDropdown } = useDropdown(MULTI_WORKSPACE_DROPDOWN_ID);
  const { signOut } = useAuth();
  const { enqueueSnackBar } = useSnackBar();
  const { colorScheme, colorSchemeList } = useColorScheme();

  const [signUpInNewWorkspaceMutation] = useSignUpInNewWorkspaceMutation();

  const setMultiWorkspaceDropdownState = useSetRecoilState(
    multiWorkspaceDropdownState,
  );

  const handleChange = async (workspace: Workspaces[0]) => {
    redirectToWorkspaceDomain(getWorkspaceUrl(workspace.workspaceUrls));
  };

  const createWorkspace = () => {
    signUpInNewWorkspaceMutation({
      onCompleted: async (data) => {
        return await redirectToWorkspaceDomain(
          getWorkspaceUrl(data.signUpInNewWorkspace.workspace.workspaceUrls),
          AppPath.Verify,
          {
            loginToken: data.signUpInNewWorkspace.loginToken.token,
          },
          '_blank',
        );
      },
      onError: (error: Error) => {
        enqueueSnackBar(error.message, {
          variant: SnackBarVariant.Error,
        });
      },
    });
  };

  return (
    <>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            Avatar={
              <Avatar
                placeholder={currentWorkspace?.displayName || ''}
                avatarUrl={currentWorkspace?.logo ?? DEFAULT_WORKSPACE_LOGO}
              />
            }
          />
        }
        EndComponent={
          <Dropdown
            clickableComponent={
              <LightIconButton
                Icon={IconDotsVertical}
                size="small"
                accent="tertiary"
              />
            }
            dropdownId={'multi-workspace-dropdown-context-menu'}
            dropdownHotkeyScope={{ scope: SelectHotkeyScope.Select }}
            dropdownComponents={
              <DropdownMenuItemsContainer>
                <MenuItem
                  LeftIcon={IconPlus}
                  text={t`Create Workspace`}
                  onClick={createWorkspace}
                />
              </DropdownMenuItemsContainer>
            }
          />
        }
      >
        {currentWorkspace?.displayName}
      </DropdownMenuHeader>
      {workspaces.length > 1 && (
        <>
          <StyledDropdownMenuItemsContainer>
            {workspaces
              .filter(({ id }) => id !== currentWorkspace?.id)
              .slice(0, 3)
              .map((workspace) => (
                <UndecoratedLink
                  key={workspace.id}
                  to={buildWorkspaceUrl(
                    getWorkspaceUrl(workspace.workspaceUrls),
                  )}
                  onClick={(event) => {
                    event?.preventDefault();
                    handleChange(workspace);
                  }}
                >
                  <MenuItemSelectAvatar
                    text={workspace.displayName ?? '(No name)'}
                    avatar={
                      <Avatar
                        placeholder={workspace.displayName || ''}
                        avatarUrl={workspace.logo ?? DEFAULT_WORKSPACE_LOGO}
                      />
                    }
                    selected={false}
                  />
                </UndecoratedLink>
              ))}
            {workspaces.length > 4 && (
              <MenuItem
                LeftIcon={IconSwitchHorizontal}
                text={t`Other workspaces`}
                onClick={() =>
                  setMultiWorkspaceDropdownState('workspaces-list')
                }
                hasSubMenu={true}
              />
            )}
          </StyledDropdownMenuItemsContainer>
          <DropdownMenuSeparator />
        </>
      )}
      <DropdownMenuItemsContainer>
        <MenuItem
          LeftIcon={colorSchemeList.find(({ id }) => id === colorScheme)?.icon}
          text={
            <>
              {t`Theme `}
              <StyledDescription>{` · ${colorScheme}`}</StyledDescription>
            </>
          }
          hasSubMenu={true}
          onClick={() => setMultiWorkspaceDropdownState('themes')}
        />
        <UndecoratedLink
          to={getSettingsPath(SettingsPath.WorkspaceMembersPage)}
          onClick={closeDropdown}
        >
          <MenuItem LeftIcon={IconUserPlus} text={t`Invite user`} />
        </UndecoratedLink>
        <MenuItem LeftIcon={IconLogout} text={t`Log out`} onClick={signOut} />
      </DropdownMenuItemsContainer>
    </>
  );
};
