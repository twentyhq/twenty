import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';
import { type AvailableWorkspace } from '~/generated-metadata/graphql';

export const useFilteredAvailableWorkspaces = () => {
  const currentWorkspace = useAtomValue(currentWorkspaceState);

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
