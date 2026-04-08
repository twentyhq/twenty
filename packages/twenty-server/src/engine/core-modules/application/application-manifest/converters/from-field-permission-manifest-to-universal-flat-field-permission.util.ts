import { type FieldPermissionManifest } from 'twenty-shared/application';
import { v5 as uuidv5 } from 'uuid';

import { type UniversalFlatFieldPermission } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-permission.type';

// Stable namespace used to derive a deterministic universalIdentifier from
// the (role, field) natural key of a FieldPermissionEntity.
const FIELD_PERMISSION_UNIVERSAL_IDENTIFIER_NAMESPACE =
  '510e2ea5-1342-4778-b24e-833d70224c02';

export const fromFieldPermissionManifestToUniversalFlatFieldPermission = ({
  fieldPermissionManifest,
  roleUniversalIdentifier,
  applicationUniversalIdentifier,
  now,
}: {
  fieldPermissionManifest: FieldPermissionManifest;
  roleUniversalIdentifier: string;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatFieldPermission => {
  return {
    universalIdentifier: uuidv5(
      `${roleUniversalIdentifier}:${fieldPermissionManifest.fieldUniversalIdentifier}`,
      FIELD_PERMISSION_UNIVERSAL_IDENTIFIER_NAMESPACE,
    ),
    applicationUniversalIdentifier,
    roleUniversalIdentifier,
    objectMetadataUniversalIdentifier:
      fieldPermissionManifest.objectUniversalIdentifier,
    fieldMetadataUniversalIdentifier:
      fieldPermissionManifest.fieldUniversalIdentifier,
    canReadFieldValue: fieldPermissionManifest.canReadFieldValue ?? null,
    canUpdateFieldValue: fieldPermissionManifest.canUpdateFieldValue ?? null,
    createdAt: now,
    updatedAt: now,
  };
};
