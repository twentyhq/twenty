import { isFieldMetadataOptionActive } from 'twenty-shared/utils';

import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';

// The server refuses an inactive default option, so it stays active until the default changes.
export const keepDefaultSelectOptionsActive = ({
  options,
  isDefaultOptionValue,
}: {
  options: FieldMetadataItemOption[];
  isDefaultOptionValue: (
    optionValue: FieldMetadataItemOption['value'],
  ) => boolean;
}): FieldMetadataItemOption[] => {
  const activeOptions: FieldMetadataItemOption[] = [];
  const inactiveOptions: FieldMetadataItemOption[] = [];

  for (const option of options) {
    const { isActive: _isActive, ...activeOption } = option;

    if (
      isFieldMetadataOptionActive(option) ||
      isDefaultOptionValue(option.value)
    ) {
      activeOptions.push(activeOption);
    } else {
      inactiveOptions.push(option);
    }
  }

  return [...activeOptions, ...inactiveOptions].map((option, position) => ({
    ...option,
    position,
  }));
};
