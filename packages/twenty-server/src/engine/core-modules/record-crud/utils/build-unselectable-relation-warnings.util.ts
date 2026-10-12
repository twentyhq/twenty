import { type ObjectPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { isRelationTargetExcludedFromSelection } from 'src/engine/api/common/common-select-fields/utils/is-relation-target-excluded-from-selection.util';
import { type CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { MORPH_OR_RELATION_FIELD_TYPES } from 'src/engine/metadata-modules/field-metadata/types/morph-or-relation-field-metadata-type.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfTypes } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-types.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const buildUnselectableRelationWarningsByFieldName = ({
  objectName,
  flatObjectMetadata,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
  selectableRelationFields,
  objectsPermissions,
}: {
  objectName: string;
  flatObjectMetadata: Pick<FlatObjectMetadata, 'id' | 'fieldIds'>;
  flatFieldMetadataMaps: FlatEntityMaps<
    Pick<
      FlatFieldMetadata,
      | 'id'
      | 'universalIdentifier'
      | 'applicationId'
      | 'workspaceId'
      | 'type'
      | 'name'
      | 'relationTargetObjectMetadataId'
    >
  >;
  flatObjectMetadataMaps: FlatEntityMaps<
    Pick<
      FlatObjectMetadata,
      | 'id'
      | 'universalIdentifier'
      | 'applicationId'
      | 'workspaceId'
      | 'nameSingular'
    >
  >;
  selectableRelationFields: CommonSelectedFields;
  objectsPermissions: Record<
    string,
    Pick<ObjectPermissions, 'restrictedFields'>
  >;
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
      !isFlatFieldMetadataOfTypes(field, [...MORPH_OR_RELATION_FIELD_TYPES]) ||
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

    if (
      isDefined(targetObject) &&
      isRelationTargetExcludedFromSelection(targetObject)
    ) {
      warningsByFieldName.set(
        field.name,
        `Field '${field.name}' on ${objectName} cannot be selected as a nested relation. Query ${targetObject.nameSingular} records directly instead.`,
      );
      continue;
    }

    const warning = isDefined(targetObject)
      ? `Field '${field.name}' on ${objectName} cannot be selected because you do not have read access to ${targetObject.nameSingular}.`
      : `Field '${field.name}' on ${objectName} cannot be selected.`;

    warningsByFieldName.set(field.name, warning);
  }

  return warningsByFieldName;
};
