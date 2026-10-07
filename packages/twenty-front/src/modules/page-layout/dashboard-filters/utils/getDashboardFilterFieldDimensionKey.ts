import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType } from '~/generated-metadata/graphql';

// Two select fields only mean the same thing when they offer the same values, so the values are part of the key.
export const getDashboardFilterFieldDimensionKey = (
  field: Pick<FieldMetadataItem, 'name' | 'type'> &
    Partial<Pick<FieldMetadataItem, 'options'>>,
): string => {
  const baseKey = `field:${field.name}:${field.type}`;

  if (
    field.type !== FieldMetadataType.SELECT &&
    field.type !== FieldMetadataType.MULTI_SELECT
  ) {
    return baseKey;
  }

  const optionValues = (field.options ?? [])
    .map((option) => option.value)
    .sort();

  return `${baseKey}:${optionValues.join(',')}`;
};
