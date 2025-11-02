import {
  FieldMetadataType,
  RelationType,
  type RestrictedFieldsPermissions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

type SelectableFieldsStructured = Record<
  string,
  boolean | Record<string, boolean>
>;

export const getAllSelectableFields = ({
  restrictedFields,
  objectMetadata,
}: {
  restrictedFields: RestrictedFieldsPermissions;
  objectMetadata: { objectMetadataMapItem: ObjectMetadataItemWithFieldMaps };
}): SelectableFieldsStructured => {
  const result: SelectableFieldsStructured = {};

  const fields = Object.values(objectMetadata.objectMetadataMapItem.fieldsById);

  for (const field of fields) {
    if (restrictedFields[field.id]?.canRead === false) continue;

    if (isCompositeFieldMetadataType(field.type)) {
      const compositeType = compositeTypeDefinitions.get(field.type);

      if (!compositeType) {
        throw new Error(
          `Composite type definition not found for type: ${field.type}`,
        );
      }

      const compositeFields: Record<string, boolean> = {};

      for (const property of compositeType.properties) {
        compositeFields[property.name] = true;
      }

      result[field.name] = compositeFields;
    } else if (
      isFieldMetadataEntityOfType(field, FieldMetadataType.RELATION) &&
      field.settings.relationType === RelationType.MANY_TO_ONE &&
      isDefined(field.settings.joinColumnName)
    ) {
      result[field.settings.joinColumnName] = true;
    } else {
      result[field.name] = true;
    }
  }

  return result;
};
