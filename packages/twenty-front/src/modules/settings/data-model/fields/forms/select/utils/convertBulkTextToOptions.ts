import { isDefined } from 'twenty-shared/utils';

import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { generateNewSelectOption } from '@/settings/data-model/fields/forms/select/utils/generateNewSelectOption';

export const convertBulkTextToOptions = (
  text: string,
  currentOptions: FieldMetadataItemOption[],
): FieldMetadataItemOption[] => {
  const parsedBulkTextOptions = text
    .trim()
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const newBulkSelectOptions: FieldMetadataItemOption[] = [];

  for (const [optionIndex, label] of parsedBulkTextOptions.entries()) {
    // try to find an existing option with the same label, so we can keep its id, color, value, and label
    const existingOption = currentOptions.find(
      (opt) => opt.label.toLowerCase() === label.toLowerCase(),
    );

    if (isDefined(existingOption)) {
      // reuse existing option meta (including original label), just update position
      newBulkSelectOptions.push({
        ...existingOption,
        position: optionIndex,
      });
    } else {
      newBulkSelectOptions.push({
        ...generateNewSelectOption(newBulkSelectOptions, label),
        position: optionIndex,
      });
    }
  }

  return newBulkSelectOptions;
};
