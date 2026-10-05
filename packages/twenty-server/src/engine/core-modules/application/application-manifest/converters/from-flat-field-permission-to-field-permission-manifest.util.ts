import { type FieldPermissionManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type UniversalFlatFieldPermission } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-permission.type';

export const fromFlatFieldPermissionToFieldPermissionManifest = ({
  flatFieldPermission,
}: {
  flatFieldPermission: UniversalFlatFieldPermission;
}): FieldPermissionManifest => ({
  universalIdentifier: flatFieldPermission.universalIdentifier,
  objectUniversalIdentifier:
    flatFieldPermission.objectMetadataUniversalIdentifier,
  fieldUniversalIdentifier:
    flatFieldPermission.fieldMetadataUniversalIdentifier,
  ...(isDefined(flatFieldPermission.canReadFieldValue)
    ? { canReadFieldValue: flatFieldPermission.canReadFieldValue }
    : {}),
  ...(isDefined(flatFieldPermission.canUpdateFieldValue)
    ? { canUpdateFieldValue: flatFieldPermission.canUpdateFieldValue }
    : {}),
});
