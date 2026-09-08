import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatFieldPermissionMaps } from 'src/engine/metadata-modules/flat-field-permission/types/flat-field-permission-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const NON_EDITABLE_SYSTEM_FIELD_NAMES = [
  'createdAt',
  'updatedAt',
  'deletedAt',
  'createdBy',
];

export type UnrestrictableFieldPermissionChanges = {
  fieldPermissionIdsToDelete: string[];
  fieldPermissionIdsToClearReadOn: string[];
};

export const computeUnrestrictableFieldPermissionChanges = ({
  applicationId,
  flatFieldPermissionMaps,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
}: {
  applicationId: string;
  flatFieldPermissionMaps: FlatFieldPermissionMaps;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): UnrestrictableFieldPermissionChanges => {
  const fieldPermissionIdsToDelete: string[] = [];
  const fieldPermissionIdsToClearReadOn: string[] = [];

  for (const flatFieldPermission of Object.values(
    flatFieldPermissionMaps.byUniversalIdentifier,
  )) {
    if (
      !isDefined(flatFieldPermission) ||
      flatFieldPermission.applicationId !== applicationId
    ) {
      continue;
    }

    const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatFieldPermission.fieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (
      isDefined(flatFieldMetadata) &&
      flatFieldMetadata.isUIEditable === false &&
      NON_EDITABLE_SYSTEM_FIELD_NAMES.includes(flatFieldMetadata.name)
    ) {
      fieldPermissionIdsToDelete.push(flatFieldPermission.id);

      continue;
    }

    if (flatFieldPermission.canReadFieldValue !== false) {
      continue;
    }

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatFieldPermission.objectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (
      !isDefined(flatObjectMetadata) ||
      flatObjectMetadata.labelIdentifierFieldMetadataId !==
        flatFieldPermission.fieldMetadataId
    ) {
      continue;
    }

    if (isDefined(flatFieldPermission.canUpdateFieldValue)) {
      fieldPermissionIdsToClearReadOn.push(flatFieldPermission.id);
    } else {
      fieldPermissionIdsToDelete.push(flatFieldPermission.id);
    }
  }

  return { fieldPermissionIdsToDelete, fieldPermissionIdsToClearReadOn };
};
