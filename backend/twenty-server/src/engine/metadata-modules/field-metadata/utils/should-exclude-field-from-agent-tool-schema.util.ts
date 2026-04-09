import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const shouldExcludeFieldFromAgentToolSchema = (
  field: FieldMetadataEntity | FlatFieldMetadata,
  excludeId = true,
): boolean => {
  const excludedFieldNames = [
    'createdAt',
    'updatedAt',
    'deletedAt',
    'searchVector',
    'createdBy',
  ];

  if (excludeId) {
    excludedFieldNames.push('id');
  }

  return excludedFieldNames.includes(field.name) || field.isSystem;
};
