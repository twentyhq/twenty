import { type PermissionFlagManifest } from 'twenty-shared/application';

import { type UniversalFlatPermissionFlag } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-permission-flag.type';

export const fromPermissionFlagManifestToUniversalFlatPermissionFlag = ({
  permissionFlagManifest,
  applicationUniversalIdentifier,
  now,
}: {
  permissionFlagManifest: PermissionFlagManifest;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatPermissionFlag => {
  return {
    universalIdentifier: permissionFlagManifest.universalIdentifier,
    applicationUniversalIdentifier,
    key: permissionFlagManifest.key,
    label: permissionFlagManifest.label,
    description: permissionFlagManifest.description ?? null,
    icon: permissionFlagManifest.icon ?? null,
    permissionType: 'tool',
    rolePermissionFlagUniversalIdentifiers: [],
    createdAt: now,
    updatedAt: now,
  };
};
