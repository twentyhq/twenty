import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getApplicationsWithPreferences } from '@/settings/app-preferences/utils/getApplicationsWithPreferences';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import { MyApplicationPreferencesDocument } from '~/generated-metadata/graphql';

export const useApplicationsWithPreferences = () => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const { data, loading, error, refetch } = useQuery(
    MyApplicationPreferencesDocument,
    {
      fetchPolicy: 'cache-and-network',
    },
  );

  const hasLoadedApplicationsWithPreferences = isDefined(data);

  return {
    applicationsWithPreferences: getApplicationsWithPreferences({
      applicationPreferences: data?.myApplicationPreferences ?? [],
      currentWorkspace,
    }),
    loading,
    hasApplicationsLoadError:
      isDefined(error) && !hasLoadedApplicationsWithPreferences,
    error,
    refetch,
  };
};
