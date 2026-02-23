import { useLingui } from '@lingui/react/macro';
import { StyledDropdownMenuSubheader } from '@/ui/layout/dropdown/components/StyledDropdownMenuSubheader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useFilteredAvailableWorkspaces } from '@/ui/navigation/navigation-drawer/hooks/useFilteredAvailableWorkspaces';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { availableWorkspacesState } from '@/auth/states/availableWorkspacesState';
import { AvailableWorkspaceItem } from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/internal/components/AvailableWorkspaceItem';

export const WorkspacesForSignIn = ({
  searchValue,
}: {
  searchValue: string;
}) => {
  const { t } = useLingui();

  const availableWorkspaces = useRecoilValueV2(availableWorkspacesState);
  const currentWorkspace = useRecoilValueV2(currentWorkspaceState);

  const { searchAvailableWorkspaces } = useFilteredAvailableWorkspaces();

  return (
    <>
      <StyledDropdownMenuSubheader>{t`Member of`}</StyledDropdownMenuSubheader>
      <DropdownMenuItemsContainer>
        {searchAvailableWorkspaces(
          searchValue,
          availableWorkspaces.availableWorkspacesForSignIn,
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
