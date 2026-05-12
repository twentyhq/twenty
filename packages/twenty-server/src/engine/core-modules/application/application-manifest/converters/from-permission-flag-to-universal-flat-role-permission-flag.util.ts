import { type UniversalFlatRolePermissionFlag } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role-permission-flag.type';
import { PermissionFlagManifest } from 'twenty-shared/application';

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
    flag: permissionFlag.flag,
    createdAt: now,
    updatedAt: now,
  };
};
