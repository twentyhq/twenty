/* @license Enterprise */

import { type ObjectsPermissionsByRoleId } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export type RoleObjectAccess = {
  canRoleRead: boolean;
  canRoleUpdate: boolean;
};

export const resolveRoleObjectAccess = ({
  rolesPermissions,
  roleId,
  objectMetadataId,
}: {
  rolesPermissions: ObjectsPermissionsByRoleId;
  roleId: string | undefined;
  objectMetadataId: string;
}): RoleObjectAccess => {
  const objectPermissions = isDefined(roleId)
    ? rolesPermissions[roleId]?.[objectMetadataId]
    : undefined;

  return {
    canRoleRead: objectPermissions?.canReadObjectRecords === true,
    canRoleUpdate: objectPermissions?.canUpdateObjectRecords === true,
  };
};
