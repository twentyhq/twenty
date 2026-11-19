import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useQuery } from '@apollo/client/react';
import {
  GetConditionalAvailabilityRolesDocument,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

export const useConditionalAvailabilityRoles = () => {
  const hasRolesPermission = useHasPermissionFlag(PermissionFlagType.ROLES);

  const { data, loading } = useQuery(GetConditionalAvailabilityRolesDocument, {
    skip: !hasRolesPermission,
  });

  return {
    hasRolesPermission,
    roles: data?.getRoles ?? [],
    isLoadingRoles: hasRolesPermission && loading,
  };
};
