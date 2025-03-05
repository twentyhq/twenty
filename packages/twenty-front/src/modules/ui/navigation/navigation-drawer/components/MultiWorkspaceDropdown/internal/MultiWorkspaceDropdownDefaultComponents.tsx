import {
  Avatar,
  IconDotsVertical,
  IconLogout,
  IconPlus,
  IconSunMoon,
  IconSwitchHorizontal,
  IconUserPlus,
  LightIconButton,
  MenuItem,
  MenuItemSelectAvatar,
  UndecoratedLink,
} from 'twenty-ui';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Workspaces, workspacesState } from '@/auth/states/workspaces';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { useLingui } from '@lingui/react/macro';
import { useBuildWorkspaceUrl } from '@/domain-manager/hooks/useBuildWorkspaceUrl';
import { multiWorkspaceDropdownState } from '@/ui/navigation/navigation-drawer/states/multiWorkspaceDropdownState';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { SettingsPath } from '@/types/SettingsPath';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MULTI_WORKSPACE_DROPDOWN_ID } from '@/ui/navigation/navigation-drawer/constants/MulitWorkspaceDropdownId';
import { useAuth } from '@/auth/hooks/useAuth';
import { AppPath } from '@/types/AppPath';
import { useSignUpInNewWorkspaceMutation } from '~/generated/graphql';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { SelectHotkeyScope } from '@/ui/input/types/SelectHotkeyScope';

export const MultiWorkspaceDropdownDefaultComponents = () => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const { t } = useLingui();
  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();
  const workspaces = useRecoilValue(workspacesState);
  const { buildWorkspaceUrl } = useBuildWorkspaceUrl();
  const { closeDropdown } = useDropdown(MULTI_WORKSPACE_DROPDOWN_ID);
  const { signOut } = useAuth();
  const { enqueueSnackBar } = useSnackBar();

  const [signUpInNewWorkspaceMutation] = useSignUpInNewWorkspaceMutation();

  const setMultiWorkspaceDropdownState = useSetRecoilState(
    multiWorkspaceDropdownState,
  );

  const handleChange = async (workspace: Workspaces[0]) => {
    redirectToWorkspaceDomain(getWorkspaceUrl(workspace.workspaceUrls));
  };

  const createWorkspace = () => {
    signUpInNewWorkspaceMutation({
      onCompleted: (data) => {
        return redirectToWorkspaceDomain(
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
    <DropdownMenuItemsContainer>
      <DropdownMenuHeader
        StartAvatar={
          <Avatar
            placeholder={currentWorkspace?.displayName || ''}
            avatarUrl={currentWorkspace?.logo ?? DEFAULT_WORKSPACE_LOGO}
          />
        }
        DropdownOnEndIcon={
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
      {workspaces
        .filter(({ id }) => id !== currentWorkspace?.id)
        .slice(0, 3)
        .map((workspace) => (
          <UndecoratedLink
            key={workspace.id}
            to={buildWorkspaceUrl(getWorkspaceUrl(workspace.workspaceUrls))}
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
              selected={currentWorkspace?.id === workspace.id}
            />
          </UndecoratedLink>
        ))}
      {workspaces.length > 4 && (
        <MenuItem
          LeftIcon={IconSwitchHorizontal}
          text={t`Other workspaces`}
          onClick={() => setMultiWorkspaceDropdownState('workspaces-list')}
          hasSubMenu={true}
        />
      )}
      <DropdownMenuSeparator />
      <MenuItem
        LeftIcon={IconSunMoon}
        text={t`Theme`}
        hasSubMenu={true}
        onClick={() => setMultiWorkspaceDropdownState('themes')}
      />
      <NavigationDrawerItem
        label={t`Invite user`}
        to={getSettingsPath(SettingsPath.WorkspaceMembersPage)}
        Icon={IconUserPlus}
        onClick={closeDropdown}
      />
      <MenuItem LeftIcon={IconLogout} text={t`Log out`} onClick={signOut} />
    </DropdownMenuItemsContainer>
  );
};
