import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getApplicationsWithPreferences } from '@/settings/app-preferences/utils/getApplicationsWithPreferences';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useQuery } from '@apollo/client/react';
import { MyApplicationPreferencesDocument } from '~/generated-metadata/graphql';

export const useApplicationsWithPreferences = () => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  // An app installed or upgraded during the session changes this list, so the
  // cached result is only shown until the refreshed one arrives.
  const { data, loading, refetch } = useQuery(
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
    refetch,
  };
};
