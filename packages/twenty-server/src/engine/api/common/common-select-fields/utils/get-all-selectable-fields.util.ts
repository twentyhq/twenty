import {
  checkIfFieldIsImageIdentifier,
  checkIfFieldIsLabelIdentifier,
} from 'twenty-shared/metadata';
import {
  FieldMetadataType,
  RelationType,
  type RestrictedFieldsPermissions,
  compositeTypeDefinitions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

type SelectableFieldsStructured = Record<
  string,
  boolean | Record<string, boolean>
>;

export const getAllSelectableFields = ({
  restrictedFields,
  flatObjectMetadata,
  flatFieldMetadataMaps,
  onlyUseLabelIdentifierFieldsInRelations = false,
}: {
  restrictedFields: RestrictedFieldsPermissions;
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  onlyUseLabelIdentifierFieldsInRelations?: boolean;
}): SelectableFieldsStructured => {
  const result: SelectableFieldsStructured = {};

  for (const fieldId of flatObjectMetadata.fieldIds) {
    const flatField = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatFieldMetadataMaps,
      flatEntityId: fieldId,
    });

    if (restrictedFields[flatField.id]?.canRead === false) continue;

    if (onlyUseLabelIdentifierFieldsInRelations) {
      const fieldIsLabelIdentifier = checkIfFieldIsLabelIdentifier(
        flatField,
        flatObjectMetadata,
      );
      const fieldIsImageIdentifier = checkIfFieldIsImageIdentifier(
        flatField,
        flatObjectMetadata,
      );
      const fieldIsIdField = flatField.name === 'id';

      if (
        !fieldIsLabelIdentifier &&
        !fieldIsImageIdentifier &&
        !fieldIsIdField
      ) {
        continue;
      }
    }

    if (isCompositeFieldMetadataType(flatField.type)) {
      const compositeType = compositeTypeDefinitions.get(flatField.type);

      if (!compositeType) {
        throw new Error(
          `Composite type definition not found for type: ${flatField.type}`,
        );
      }

      const compositeFields: Record<string, boolean> = {};

      for (const property of compositeType.properties) {
        compositeFields[property.name] = true;
      }

      result[flatField.name] = compositeFields;
    } else if (
      isFlatFieldMetadataOfType(flatField, FieldMetadataType.RELATION) &&
      flatField.settings.relationType === RelationType.MANY_TO_ONE &&
      isDefined(flatField.settings.joinColumnName)
    ) {
      result[flatField.settings.joinColumnName] = true;
    } else {
      result[flatField.name] = true;
    }
  }

  return result;
};
