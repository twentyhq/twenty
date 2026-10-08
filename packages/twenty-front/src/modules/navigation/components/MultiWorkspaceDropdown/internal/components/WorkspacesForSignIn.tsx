import { Dropdown } from 'twenty-ui/components/navigation';
import { useLingui } from '@lingui/react/macro';
import { useFilteredAvailableWorkspaces } from '@/navigation/hooks/useFilteredAvailableWorkspaces';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { availableWorkspacesState } from '@/auth/states/availableWorkspacesState';
import { AvailableWorkspaceItem } from '@/navigation/components/MultiWorkspaceDropdown/internal/components/AvailableWorkspaceItem';

export const WorkspacesForSignIn = ({
  searchValue,
}: {
  searchValue: string;
}) => {
  const { t } = useLingui();

  const availableWorkspaces = useAtomStateValue(availableWorkspacesState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const { searchAvailableWorkspaces } = useFilteredAvailableWorkspaces();

  return (
    <Dropdown.Section label={t`Member of`} scrollable>
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
    </Dropdown.Section>
  );
};
