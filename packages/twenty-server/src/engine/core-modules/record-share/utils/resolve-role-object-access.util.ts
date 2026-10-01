/* @license Enterprise */

import { type ObjectPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export type RoleObjectAccess = {
  canRoleRead: boolean | null;
  canRoleUpdate: boolean | null;
};

type RoleObjectPermissions = Pick<
  ObjectPermissions,
  'canReadObjectRecords' | 'canUpdateObjectRecords'
>;

// Null when the role cannot be resolved, so a missing membership is never
// reported as a role that cannot read the object
export const resolveRoleObjectAccess = ({
  rolesPermissions,
  roleId,
  objectMetadataId,
}: {
  rolesPermissions: Record<string, Record<string, RoleObjectPermissions>>;
  roleId: string | undefined;
  objectMetadataId: string;
}): RoleObjectAccess => {
  const roleObjectsPermissions = isDefined(roleId)
    ? rolesPermissions[roleId]
    : undefined;

  if (!isDefined(roleObjectsPermissions)) {
    return { canRoleRead: null, canRoleUpdate: null };
  }

  const objectPermissions = roleObjectsPermissions[objectMetadataId];

  return {
    canRoleRead: objectPermissions?.canReadObjectRecords === true,
    canRoleUpdate: objectPermissions?.canUpdateObjectRecords === true,
  };
};
