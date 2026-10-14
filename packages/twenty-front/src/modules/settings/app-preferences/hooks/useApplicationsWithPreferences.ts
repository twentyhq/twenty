import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getApplicationsWithPreferences } from '@/settings/app-preferences/utils/getApplicationsWithPreferences';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import { MyApplicationPreferencesDocument } from '~/generated-metadata/graphql';

export const useApplicationsWithPreferences = () => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  // Installs and upgrades during the session change this list
  const { data, loading, error, refetch } = useQuery(
    MyApplicationPreferencesDocument,
    {
      fetchPolicy: 'cache-and-network',
    },
  );

  return {
    applicationsWithPreferences: getApplicationsWithPreferences({
      applicationPreferences: data?.myApplicationPreferences ?? [],
      installedApplications: currentWorkspace?.installedApplications ?? [],
    }),
    loading,
    // A failed refetch keeps the previous list, so an error can come with data
    hasLoadedApplicationsWithPreferences: isDefined(data),
    error,
    refetch,
  };
};
