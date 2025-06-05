import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRecoilValue } from 'recoil';

export const useFilteredWorkspaces = () => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const searchWorkspace = <
    T extends { displayName?: string | null; id: string },
  >(
    searchValue: string,
    workspaces: Array<T>,
  ): Array<T> => {
    return workspaces.filter(
      (workspace) =>
        currentWorkspace?.id &&
        workspace.id !== currentWorkspace.id &&
        workspace.displayName
          ?.toLowerCase()
          .includes(searchValue.toLowerCase()),
    );
  };

  return {
    searchWorkspace,
  };
};
