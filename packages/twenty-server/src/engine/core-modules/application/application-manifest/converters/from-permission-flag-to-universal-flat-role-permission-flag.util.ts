import { type PermissionFlagManifest } from 'twenty-shared/application';
import { SystemPermissionFlag } from 'twenty-shared/constants';

import { type UniversalFlatRolePermissionFlag } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role-permission-flag.type';

export const fromPermissionFlagToUniversalFlatRolePermissionFlag = ({
  permissionFlag,
  roleUniversalIdentifier,
  applicationUniversalIdentifier,
  now,
}: {
  permissionFlag: PermissionFlagManifest;
  roleUniversalIdentifier: string;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatRolePermissionFlag => {
  return {
    universalIdentifier: permissionFlag.universalIdentifier,
    applicationUniversalIdentifier,
    roleUniversalIdentifier,
    permissionFlagUniversalIdentifier:
      SystemPermissionFlag[permissionFlag.flag],
    createdAt: now,
    updatedAt: now,
  };
};
