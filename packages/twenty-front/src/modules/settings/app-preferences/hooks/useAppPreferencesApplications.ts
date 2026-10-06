import { useRefetchOnApplicationOperation } from '@/applications/hooks/useRefetchOnApplicationOperation';
import { useQuery } from '@apollo/client/react';
import { FindManyApplicationsWithSettingsMenuItemsDocument } from '~/generated-metadata/graphql';

// The installed applications with what the app preferences page needs from
// them: their display data and the settings menu items they declare.
export const useAppPreferencesApplications = () => {
  const { data, loading, refetch } = useQuery(
    FindManyApplicationsWithSettingsMenuItemsDocument,
  );

  useRefetchOnApplicationOperation({ refetch });

  return { applications: data?.findManyApplications ?? [], loading };
};
