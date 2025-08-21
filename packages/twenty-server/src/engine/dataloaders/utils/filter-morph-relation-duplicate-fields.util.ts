import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';

export const filterMorphRelationDuplicateFieldsDTO = (
  fields: Pick<FieldMetadataDTO, 'name' | 'id'>[],
) => {
  return fields.filter((currentField) => {
    return !fields.some(
      (otherField) =>
        otherField.name === currentField.name &&
        otherField.id > currentField.id,
    );
  });
};
