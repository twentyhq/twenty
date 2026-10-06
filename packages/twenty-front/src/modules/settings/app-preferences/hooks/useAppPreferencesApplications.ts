import { useRefetchOnApplicationOperation } from '@/applications/hooks/useRefetchOnApplicationOperation';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useQuery } from '@apollo/client/react';
import {
  FindManyApplicationsWithSettingsMenuItemsDocument,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

export const useAppPreferencesApplications = () => {
  // findManyApplications is gated by the APPLICATIONS setting on the server,
  // so a member without it gets the preinstalled apps only.
  const hasApplicationsPermission = useHasPermissionFlag(
    PermissionFlagType.APPLICATIONS,
  );

  const { data, loading, refetch } = useQuery(
    FindManyApplicationsWithSettingsMenuItemsDocument,
    { skip: !hasApplicationsPermission },
  );

  useRefetchOnApplicationOperation({ refetch });

  return { applications: data?.findManyApplications ?? [], loading };
};
