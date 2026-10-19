import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getApplicationsWithPreferences } from '@/settings/app-preferences/utils/getApplicationsWithPreferences';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useQuery } from '@apollo/client/react';
import { MyApplicationPreferencesDocument } from '~/generated-metadata/graphql';

export const useApplicationsWithPreferences = () => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const { data, loading, refetch } = useQuery(
    MyApplicationPreferencesDocument,
    {
      fetchPolicy: 'cache-and-network',
    },
  );

  return {
    applicationsWithPreferences: getApplicationsWithPreferences({
      applicationPreferences: data?.myApplicationPreferences ?? [],
      currentWorkspace,
    }),
    loading,
    refetch,
  };
};
