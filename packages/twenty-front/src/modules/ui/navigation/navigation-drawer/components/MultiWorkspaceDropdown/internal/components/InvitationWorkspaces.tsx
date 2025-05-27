import { useLingui } from '@lingui/react/macro';
import { StyledDropdownMenuSubheader } from '@/ui/layout/dropdown/components/StyledDropdownMenuSubheader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useFilteredWorkspaces } from '@/ui/navigation/navigation-drawer/hooks/useFilteredWorkspaces';
import { WorkspaceItem } from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/internal/components/WorkspaceItem';
import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { currentUserAvailableWorkspacesState } from '@/auth/states/currentUserAvailableWorkspaces';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRecoilValue } from 'recoil';

export const InvitationWorkspaces = ({
  searchValue,
}: {
  searchValue: string;
}) => {
  const { t } = useLingui();

  const currentUserAvailableWorkspaces = useRecoilValue(
    currentUserAvailableWorkspacesState,
  );
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const { searchWorkspace } = useFilteredWorkspaces();

  return (
    <>
      <StyledDropdownMenuSubheader>{t`Invitations`}</StyledDropdownMenuSubheader>
      <DropdownMenuItemsContainer scrollable={false}>
        {searchWorkspace(searchValue, currentUserAvailableWorkspaces).map(
          (workspace) => (
            <WorkspaceItem
              key={workspace.id}
              workspace={workspace}
              isSelected={currentWorkspace?.id === workspace.id}
              link={workspace.workspaceUrl}
            />
          ),
        )}
      </DropdownMenuItemsContainer>
    </>
  );
};
