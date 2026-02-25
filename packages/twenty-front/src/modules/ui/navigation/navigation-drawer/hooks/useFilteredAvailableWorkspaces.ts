import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type AvailableWorkspace } from '~/generated-metadata/graphql';

export const useFilteredAvailableWorkspaces = () => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const searchAvailableWorkspaces = (
    searchValue: string,
    availableWorkspaces: Array<AvailableWorkspace>,
  ) => {
    return availableWorkspaces.filter(
      (availableWorkspace) =>
        currentWorkspace?.id &&
        availableWorkspace.id !== currentWorkspace.id &&
        availableWorkspace.displayName
          ?.toLowerCase()
          .includes(searchValue.toLowerCase()),
    );
  };

  return {
    searchAvailableWorkspaces,
  };
};
