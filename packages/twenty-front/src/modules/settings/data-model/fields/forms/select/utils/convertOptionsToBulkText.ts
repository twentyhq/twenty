import { isFieldMetadataOptionActive } from 'twenty-shared/utils';

import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';

export const convertOptionsToBulkText = (
  options: FieldMetadataItemOption[],
): string => {
  return options
    .filter(isFieldMetadataOptionActive)
    .map((option) => option.label)
    .join('\n');
};
