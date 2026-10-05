import { getRolePermissionFlagUniversalIdentifier } from 'twenty-shared/application';

import { type UniversalFlatRolePermissionFlag } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role-permission-flag.type';

export const fromPermissionFlagToUniversalFlatRolePermissionFlag = ({
  permissionFlagUniversalIdentifier,
  roleUniversalIdentifier,
  applicationUniversalIdentifier,
  now,
}: {
  permissionFlagUniversalIdentifier: string;
  roleUniversalIdentifier: string;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatRolePermissionFlag => {
  return {
    universalIdentifier: getRolePermissionFlagUniversalIdentifier({
      applicationUniversalIdentifier,
      roleUniversalIdentifier,
      permissionFlagUniversalIdentifier,
    }),
    applicationUniversalIdentifier,
    roleUniversalIdentifier,
    permissionFlagUniversalIdentifier,
    createdAt: now,
    updatedAt: now,
  };
};
