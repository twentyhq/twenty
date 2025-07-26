import { FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';

export const filterMorphRelationDuplicateFieldsDTO = (
  fields: FieldMetadataDTO[],
) => {
  return fields.filter((currentField) => {
    return !fields.some(
      (otherField) =>
        otherField.name === currentField.name &&
        otherField.id > currentField.id,
    );
  });
};
