import {
  getObjectPermissionUniversalIdentifier,
  type ObjectPermissionManifest,
} from 'twenty-shared/application';
import { type UniversalFlatObjectPermission } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-permission.type';

export const fromObjectPermissionManifestToUniversalFlatObjectPermission = ({
  objectPermissionManifest,
  roleUniversalIdentifier,
  applicationUniversalIdentifier,
  now,
}: {
  objectPermissionManifest: ObjectPermissionManifest;
  roleUniversalIdentifier: string;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatObjectPermission => {
  return {
    universalIdentifier:
      objectPermissionManifest.universalIdentifier ??
      getObjectPermissionUniversalIdentifier({
        applicationUniversalIdentifier,
        roleUniversalIdentifier,
        objectUniversalIdentifier:
          objectPermissionManifest.objectUniversalIdentifier,
      }),
    applicationUniversalIdentifier,
    roleUniversalIdentifier,
    objectMetadataUniversalIdentifier:
      objectPermissionManifest.objectUniversalIdentifier,
    canReadObjectRecords: objectPermissionManifest.canReadObjectRecords ?? null,
    canUpdateObjectRecords:
      objectPermissionManifest.canUpdateObjectRecords ?? null,
    canSoftDeleteObjectRecords:
      objectPermissionManifest.canSoftDeleteObjectRecords ?? null,
    canDestroyObjectRecords:
      objectPermissionManifest.canDestroyObjectRecords ?? null,
    createdAt: now,
    updatedAt: now,
  };
};
