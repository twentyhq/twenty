import { isFieldMetadataOptionActive } from 'twenty-shared/utils';

import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';

export const splitSelectOptionsByIsActive = (
  options: FieldMetadataItemOption[],
): {
  activeOptions: FieldMetadataItemOption[];
  inactiveOptions: FieldMetadataItemOption[];
} => ({
  activeOptions: options.filter(isFieldMetadataOptionActive),
  inactiveOptions: options.filter(
    (option) => !isFieldMetadataOptionActive(option),
  ),
});
