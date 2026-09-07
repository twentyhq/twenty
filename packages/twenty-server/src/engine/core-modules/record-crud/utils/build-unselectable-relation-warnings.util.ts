import { type ObjectsPermissions } from 'twenty-shared/types';

import { type CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { isDefined } from 'twenty-shared/utils';

export const buildUnselectableRelationWarningsByFieldName = ({
  objectName,
  flatObjectMetadata,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
  selectableRelationFields,
  objectsPermissions,
}: {
  objectName: string;
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  selectableRelationFields: CommonSelectedFields;
  objectsPermissions: ObjectsPermissions;
}): Map<string, string> => {
  const warningsByFieldName = new Map<string, string>();

  for (const fieldId of flatObjectMetadata.fieldIds) {
    const field = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: fieldId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(field)) {
      continue;
    }

    if (
      !isMorphOrRelationFlatFieldMetadata(field) ||
      isDefined(selectableRelationFields[field.name])
    ) {
      continue;
    }

    const isSourceFieldRestricted =
      objectsPermissions[flatObjectMetadata.id]?.restrictedFields[field.id]
        ?.canRead === false;

    if (isSourceFieldRestricted) {
      warningsByFieldName.set(
        field.name,
        `Field '${field.name}' on ${objectName} cannot be selected because your role restricts access to this field.`,
      );
      continue;
    }

    const targetObject = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: field.relationTargetObjectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    const warning = isDefined(targetObject)
      ? `Field '${field.name}' on ${objectName} cannot be selected because you do not have read access to ${targetObject.nameSingular}.`
      : `Field '${field.name}' on ${objectName} cannot be selected.`;

    warningsByFieldName.set(field.name, warning);
  }

  return warningsByFieldName;
};
