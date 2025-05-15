import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { Workspaces, workspacesState } from '@/auth/states/workspaces';
import { useBuildWorkspaceUrl } from '@/domain-manager/hooks/useBuildWorkspaceUrl';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import { multiWorkspaceDropdownState } from '@/ui/navigation/navigation-drawer/states/multiWorkspaceDropdownState';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Avatar, IconChevronLeft } from 'twenty-ui/display';
import { MenuItemSelectAvatar, UndecoratedLink } from 'twenty-ui/navigation';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';

export const MultiWorkspaceDropdownWorkspacesListComponents = () => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const workspaces = useRecoilValue(workspacesState);
  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();
  const { buildWorkspaceUrl } = useBuildWorkspaceUrl();
  const { t } = useLingui();

  const handleChange = async (workspace: Workspaces[0]) => {
    await redirectToWorkspaceDomain(getWorkspaceUrl(workspace.workspaceUrls));
  };
  const setMultiWorkspaceDropdownState = useSetRecoilState(
    multiWorkspaceDropdownState,
  );
  const [searchValue, setSearchValue] = useState('');

  return (
    <DropdownMenuItemsContainer>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={() => setMultiWorkspaceDropdownState('default')}
            Icon={IconChevronLeft}
          />
        }
      >
        {t`Other workspaces`}
      </DropdownMenuHeader>
      <DropdownMenuSearchInput
        placeholder={t`Search`}
        autoFocus
        onChange={(event) => {
          setSearchValue(event.target.value);
        }}
      />
      <DropdownMenuSeparator />
      {workspaces
        .filter(
          (workspace) =>
            workspace.id !== currentWorkspace?.id &&
            workspace.displayName
              ?.toLowerCase()
              .includes(searchValue.toLowerCase()),
        )
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
    </DropdownMenuItemsContainer>
  );
};
