import { isDefined, isFieldMetadataOptionActive } from 'twenty-shared/utils';

import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { computeOptionValueFromLabel } from '@/object-metadata/utils/computeOptionValueFromLabel';
import { generateNewSelectOption } from '@/settings/data-model/fields/forms/select/utils/generateNewSelectOption';

export const convertBulkTextToOptions = ({
  text,
  currentOptions,
  nonRemovableOptionIds = new Set(),
}: {
  text: string;
  currentOptions: FieldMetadataItemOption[];
  nonRemovableOptionIds?: ReadonlySet<string>;
}): FieldMetadataItemOption[] => {
  const parsedBulkTextOptions = text
    .trim()
    .split('\n')
    .map((line) => line.trim())
    .filter(
      (line, index, lines) =>
        line.length > 0 &&
        lines.findIndex(
          (otherLine) => otherLine.toLowerCase() === line.toLowerCase(),
        ) === index,
    );

  const listedOptions: FieldMetadataItemOption[] = [];

  for (const label of parsedBulkTextOptions) {
    const unlistedOptions = currentOptions.filter(
      (option) => !listedOptions.some(({ id }) => id === option.id),
    );
    const optionWithLabel = unlistedOptions.find(
      (option) => option.label.toLowerCase() === label.toLowerCase(),
    );
    // A new option reusing a kept option's value would be a duplicate, so the line renames it.
    const optionWithValue = unlistedOptions.find(
      (option) => option.value === computeOptionValueFromLabel(label),
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
  // The text lists only active options, so unlisted ones that cannot be dropped stay inactive.
  const unlistedInactiveOptions = currentOptions
    .filter(
      (option) =>
        !listedOptionIds.has(option.id) &&
        (!isFieldMetadataOptionActive(option) ||
          nonRemovableOptionIds.has(option.id)),
    )
    .map((option) => ({ ...option, isActive: false }));

  return [...listedOptions, ...unlistedInactiveOptions].map(
    (option, position) => ({ ...option, position }),
  );
};
