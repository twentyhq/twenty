import {
  getObjectPermissionUniversalIdentifier,
  type ObjectRecordsPermissionsManifest,
} from 'twenty-shared/application';

import { type UniversalFlatObjectPermission } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-permission.type';

export const fromObjectRecordsPermissionsManifestToUniversalFlatObjectPermission =
  ({
    objectRecordsPermissionsManifest,
    roleUniversalIdentifier,
    applicationUniversalIdentifier,
    now,
  }: {
    objectRecordsPermissionsManifest: Omit<
      ObjectRecordsPermissionsManifest,
      'rowLevelRecordsPermissions'
    >;
    roleUniversalIdentifier: string;
    applicationUniversalIdentifier: string;
    now: string;
  }): UniversalFlatObjectPermission => ({
    universalIdentifier:
      objectRecordsPermissionsManifest.universalIdentifier ??
      getObjectPermissionUniversalIdentifier({
        applicationUniversalIdentifier,
        roleUniversalIdentifier,
        objectUniversalIdentifier:
          objectRecordsPermissionsManifest.objectUniversalIdentifier,
      }),
    applicationUniversalIdentifier,
    roleUniversalIdentifier,
    objectMetadataUniversalIdentifier:
      objectRecordsPermissionsManifest.objectUniversalIdentifier,
    canReadObjectRecords:
      objectRecordsPermissionsManifest.canReadAllRecords ?? null,
    canCreateObjectRecords:
      objectRecordsPermissionsManifest.canCreateAllRecords ??
      objectRecordsPermissionsManifest.canUpdateAllRecords ??
      null,
    canUpdateObjectRecords:
      objectRecordsPermissionsManifest.canUpdateAllRecords ?? null,
    canSoftDeleteObjectRecords:
      objectRecordsPermissionsManifest.canSoftDeleteAllRecords ?? null,
    canDestroyObjectRecords:
      objectRecordsPermissionsManifest.canDestroyAllRecords ?? null,
    createdAt: now,
    updatedAt: now,
  });
