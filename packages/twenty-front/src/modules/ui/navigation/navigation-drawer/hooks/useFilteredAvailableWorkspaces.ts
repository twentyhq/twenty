import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { type AvailableWorkspace } from '~/generated-metadata/graphql';

export const useFilteredAvailableWorkspaces = () => {
  const currentWorkspace = useRecoilValueV2(currentWorkspaceState);

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
