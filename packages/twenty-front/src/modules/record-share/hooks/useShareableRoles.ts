import { useQuery } from '@apollo/client/react';

import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import {
  GetRolesDocument,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

export const useShareableRoles = () => {
  const hasRolesPermission = useHasPermissionFlag(PermissionFlagType.ROLES);

  const { data } = useQuery(GetRolesDocument, { skip: !hasRolesPermission });

  return { roles: data?.getRoles ?? [] };
};
