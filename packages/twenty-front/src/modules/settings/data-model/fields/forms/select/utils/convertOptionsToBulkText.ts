import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';

export const convertOptionsToBulkText = (
  options: FieldMetadataItemOption[],
): string => {
  return options.map((option) => option.label).join('\n');
};
