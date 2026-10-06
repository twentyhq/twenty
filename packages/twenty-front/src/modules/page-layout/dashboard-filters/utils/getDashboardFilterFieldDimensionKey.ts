import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType } from 'twenty-shared/types';

const FIELD_TYPES_MERGED_BY_OPTIONS = [
  FieldMetadataType.SELECT,
  FieldMetadataType.MULTI_SELECT,
];

// Two fields are the same dimension when they share a name and a type; select fields must also offer the same option values, or a value picked for one would not exist on the other.
export const getDashboardFilterFieldDimensionKey = (
  field: Pick<FieldMetadataItem, 'name' | 'type'> & {
    options?: { value: string }[] | null;
  },
): string => {
  const baseKey = `${field.name}:${field.type}`;

  if (!FIELD_TYPES_MERGED_BY_OPTIONS.includes(field.type)) {
    return baseKey;
  }

  const optionValues = (field.options ?? [])
    .map((option) => option.value)
    .toSorted((optionValueA, optionValueB) =>
      optionValueA.localeCompare(optionValueB),
    );

  return `${baseKey}:${optionValues.join(',')}`;
};
