import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRecoilValue } from 'recoil';
import { type AvailableWorkspace } from '~/generated/graphql';

export const useFilteredAvailableWorkspaces = () => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

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
