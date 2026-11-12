import { isDefined } from 'twenty-shared/utils';

import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { computeOptionValueFromLabel } from '@/object-metadata/utils/computeOptionValueFromLabel';
import { generateNewSelectOption } from '@/settings/data-model/fields/forms/select/utils/generateNewSelectOption';

export const convertBulkTextToOptions = (
  text: string,
  currentOptions: FieldMetadataItemOption[],
  nonRemovableOptionIds: ReadonlySet<string> = new Set(),
): FieldMetadataItemOption[] => {
  const parsedBulkTextOptions = text
    .trim()
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const listedOptions: FieldMetadataItemOption[] = [];

  for (const label of parsedBulkTextOptions) {
    const optionWithLabel = currentOptions.find(
      (option) => option.label.toLowerCase() === label.toLowerCase(),
    );
    // A new option with the value of a kept one would be rejected as a duplicate, so the
    // line renames that option instead.
    const optionWithValue = currentOptions.find(
      (option) =>
        option.value === computeOptionValueFromLabel(label) &&
        !listedOptions.some(({ id }) => id === option.id),
    );
    const existingOption =
      optionWithLabel ??
      (isDefined(optionWithValue) ? { ...optionWithValue, label } : undefined);

    if (isDefined(existingOption)) {
      const { isActive: _isActive, ...activeExistingOption } = existingOption;

      listedOptions.push(activeExistingOption);
    } else {
      listedOptions.push(generateNewSelectOption(listedOptions, label));
    }
  }

  const listedOptionIds = new Set(listedOptions.map(({ id }) => id));
  // The text only lists active options: an unlisted one is dropped when it can be,
  // deactivated otherwise, and an inactive one stays as it was.
  const unlistedInactiveOptions = currentOptions
    .filter(
      (option) =>
        !listedOptionIds.has(option.id) &&
        (option.isActive === false || nonRemovableOptionIds.has(option.id)),
    )
    .map((option) => ({ ...option, isActive: false }));

  return [...listedOptions, ...unlistedInactiveOptions].map(
    (option, position) => ({ ...option, position }),
  );
};
