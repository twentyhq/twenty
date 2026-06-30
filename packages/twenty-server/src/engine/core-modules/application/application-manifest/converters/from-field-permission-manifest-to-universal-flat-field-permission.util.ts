import { type FieldPermissionManifest } from 'twenty-shared/application';
import { type UniversalFlatFieldPermission } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-permission.type';

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
    universalIdentifier: fieldPermissionManifest.universalIdentifier,
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
