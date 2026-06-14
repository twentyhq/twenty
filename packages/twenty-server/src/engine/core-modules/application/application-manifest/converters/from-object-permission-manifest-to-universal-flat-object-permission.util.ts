import { type ObjectPermissionManifest } from 'twenty-shared/application';
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
    universalIdentifier: objectPermissionManifest.universalIdentifier,
    applicationUniversalIdentifier,
    roleUniversalIdentifier,
    objectMetadataUniversalIdentifier:
      objectPermissionManifest.objectUniversalIdentifier,
    canReadObjectRecords: objectPermissionManifest.canReadObjectRecords,
    canUpdateObjectRecords: objectPermissionManifest.canUpdateObjectRecords,
    canSoftDeleteObjectRecords:
      objectPermissionManifest.canSoftDeleteObjectRecords,
    canDestroyObjectRecords: objectPermissionManifest.canDestroyObjectRecords,
    createdAt: now,
    updatedAt: now,
  };
};
