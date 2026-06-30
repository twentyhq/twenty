import { useLingui } from '@lingui/react/macro';
import { StyledDropdownMenuSubheader } from '@/ui/layout/dropdown/components/StyledDropdownMenuSubheader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useFilteredAvailableWorkspaces } from '@/ui/navigation/navigation-drawer/hooks/useFilteredAvailableWorkspaces';
import { AvailableWorkspaceItem } from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/internal/components/AvailableWorkspaceItem';
import { availableWorkspacesState } from '@/auth/states/availableWorkspacesState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const WorkspacesForSignUp = ({
  searchValue,
}: {
  searchValue: string;
}) => {
  const { t } = useLingui();

  const availableWorkspaces = useAtomStateValue(availableWorkspacesState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const { searchAvailableWorkspaces } = useFilteredAvailableWorkspaces();

  return (
    <>
      <StyledDropdownMenuSubheader>{t`Invitations`}</StyledDropdownMenuSubheader>
      <DropdownMenuItemsContainer scrollable={false}>
        {searchAvailableWorkspaces(
          searchValue,
          availableWorkspaces.availableWorkspacesForSignUp,
        ).map((availableWorkspace) => (
          <AvailableWorkspaceItem
            key={availableWorkspace.id}
            availableWorkspace={availableWorkspace}
            isSelected={currentWorkspace?.id === availableWorkspace.id}
          />
        ))}
      </DropdownMenuItemsContainer>
    </>
  );
};
