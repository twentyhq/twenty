import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useQuery } from '@apollo/client/react';
import {
  GetRolesDocument,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

export const useConditionalDisplayRoles = () => {
  const hasRolesPermission = useHasPermissionFlag(PermissionFlagType.ROLES);

  const { data } = useQuery(GetRolesDocument, { skip: !hasRolesPermission });

  const roles = (data?.getRoles ?? []).filter(
    (role) => role.canBeAssignedToUsers,
  );

  return { roles };
};
