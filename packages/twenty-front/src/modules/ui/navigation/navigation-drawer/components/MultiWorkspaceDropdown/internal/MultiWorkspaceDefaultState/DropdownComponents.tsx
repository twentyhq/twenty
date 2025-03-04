import {
  Avatar,
  IconLogout,
  IconPlus,
  IconSunMoon,
  IconSwitchHorizontal,
  IconUserPlus,
  MenuItem,
  MenuItemSelectAvatar,
  UndecoratedLink,
} from 'twenty-ui';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { MenuItemWithOptionDropdown } from '@/ui/navigation/menu-item/components/MenuItemWithOptionDropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';
import { useRecoilValue } from 'recoil';
import { Workspaces, workspacesState } from '@/auth/states/workspaces';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { useLingui } from '@lingui/react/macro';
import { useBuildWorkspaceUrl } from '@/domain-manager/hooks/useBuildWorkspaceUrl';

export const DropdownComponents = () => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const { t } = useLingui();
  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();
  const workspaces = useRecoilValue(workspacesState);
  const { buildWorkspaceUrl } = useBuildWorkspaceUrl();

  const handleChange = async (workspace: Workspaces[0]) => {
    redirectToWorkspaceDomain(getWorkspaceUrl(workspace.workspaceUrls));
  };

  return (
    <DropdownMenuItemsContainer>
      <MenuItemWithOptionDropdown
        LeftComponent={
          <Avatar
            placeholder={currentWorkspace?.displayName || ''}
            avatarUrl={currentWorkspace?.logo ?? DEFAULT_WORKSPACE_LOGO}
          />
        }
        dropdownId="multiworkspace-dropdown"
        text={currentWorkspace?.displayName}
        dropdownContent={
          <DropdownMenuItemsContainer>
            <MenuItem
              LeftIcon={IconPlus}
              text={t`Create Workspace`}
              onClick={() => console.log('create workspace')}
            />
          </DropdownMenuItemsContainer>
        }
      />
      <DropdownMenuSeparator />
      {workspaces
        .filter(({ id }) => id !== currentWorkspace?.id)
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
      {workspaces.length > 3 && (
        <MenuItem
          LeftIcon={IconSwitchHorizontal}
          text="Other workspaces"
          hasSubMenu={true}
        />
      )}
      <DropdownMenuSeparator />
      <MenuItem LeftIcon={IconSunMoon} text={t`Theme`} hasSubMenu={true} />
      <MenuItem LeftIcon={IconUserPlus} text={t`Invite user`} />
      <MenuItem LeftIcon={IconLogout} text={t`Log out`} />
    </DropdownMenuItemsContainer>
  );
};
