import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isDefined } from 'twenty-shared/utils';
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
        isDefined(currentWorkspace?.id) &&
        availableWorkspace.id !== currentWorkspace.id &&
        availableWorkspace.displayName
          ?.toLowerCase()
          .includes(searchValue.toLowerCase()) === true,
    );
  };

  return {
    searchAvailableWorkspaces,
  };
};
