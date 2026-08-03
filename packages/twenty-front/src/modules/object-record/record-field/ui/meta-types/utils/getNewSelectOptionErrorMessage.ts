import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { OPTION_VALUE_MAXIMUM_LENGTH } from '@/settings/data-model/constants/OptionValueMaximumLength';
import { t } from '@lingui/core/macro';

// The server derives a Postgres enum member from the label, so reject the names
// it cannot represent before paying for a round trip.
export const getNewSelectOptionErrorMessage = ({
  optionName,
  newOptionValue,
  currentOptions,
}: {
  optionName: string;
  newOptionValue: string;
  currentOptions: FieldMetadataItemOption[];
}) => {
  if (
    optionName.length > OPTION_VALUE_MAXIMUM_LENGTH ||
    newOptionValue.length > OPTION_VALUE_MAXIMUM_LENGTH
  ) {
    return t`Option names are limited to ${OPTION_VALUE_MAXIMUM_LENGTH} characters.`;
  }

  if (optionName.includes(',')) {
    return t`Option names cannot contain a comma.`;
  }

  if (newOptionValue.length === 0) {
    return t`"${optionName}" cannot be used as an option name.`;
  }

  if (currentOptions.some((option) => option.value === newOptionValue)) {
    return t`An option matching "${optionName}" already exists.`;
  }

  return undefined;
};
