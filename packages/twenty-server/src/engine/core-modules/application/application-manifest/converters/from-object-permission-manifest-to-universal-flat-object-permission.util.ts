import { type ObjectPermissionManifest } from 'twenty-shared/application';
import { v5 as uuidv5 } from 'uuid';

import { type UniversalFlatObjectPermission } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-permission.type';

// Stable namespace used to derive a deterministic universalIdentifier from
// the (role, object) natural key of an ObjectPermissionEntity.
const OBJECT_PERMISSION_UNIVERSAL_IDENTIFIER_NAMESPACE =
  'd371a503-0374-43ef-9be3-e015ee9eba51';

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
    universalIdentifier: uuidv5(
      `${roleUniversalIdentifier}:${objectPermissionManifest.objectUniversalIdentifier}`,
      OBJECT_PERMISSION_UNIVERSAL_IDENTIFIER_NAMESPACE,
    ),
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
