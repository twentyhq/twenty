import { type UniversalFlatPermissionFlag } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-permission-flag.type';
import { PermissionFlagManifest } from 'twenty-shared/application';

export const fromPermissionFlagToUniversalFlatPermissionFlag = ({
  permissionFlag,
  roleUniversalIdentifier,
  applicationUniversalIdentifier,
  now,
}: {
  permissionFlag: PermissionFlagManifest;
  roleUniversalIdentifier: string;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatPermissionFlag => {
  return {
    universalIdentifier: permissionFlag.universalIdentifier,
    applicationUniversalIdentifier,
    roleUniversalIdentifier,
    flag: permissionFlag.flag,
    createdAt: now,
    updatedAt: now,
  };
};
