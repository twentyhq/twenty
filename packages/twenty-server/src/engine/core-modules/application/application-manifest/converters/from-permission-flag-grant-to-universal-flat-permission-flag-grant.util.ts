import { type UniversalFlatPermissionFlagGrant } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-permission-flag-grant.type';
import { PermissionFlagGrantManifest } from 'twenty-shared/application';

export const fromPermissionFlagGrantToUniversalFlatPermissionFlagGrant = ({
  permissionFlagGrant,
  roleUniversalIdentifier,
  applicationUniversalIdentifier,
  now,
}: {
  permissionFlagGrant: PermissionFlagGrantManifest;
  roleUniversalIdentifier: string;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatPermissionFlagGrant => {
  return {
    universalIdentifier: permissionFlagGrant.universalIdentifier,
    applicationUniversalIdentifier,
    roleUniversalIdentifier,
    flag: permissionFlagGrant.flag,
    createdAt: now,
    updatedAt: now,
  };
};
