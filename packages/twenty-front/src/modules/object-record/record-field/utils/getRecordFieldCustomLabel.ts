import { trimAndRemoveDuplicatedWhitespacesFromString } from 'twenty-shared/utils';

// Storing the default header would pin it, so a later rename of the field would not show
export const getRecordFieldCustomLabel = ({
  editedLabel,
  defaultLabel,
}: {
  editedLabel: string;
  defaultLabel: string;
}): string | null => {
  const normalizedLabel =
    trimAndRemoveDuplicatedWhitespacesFromString(editedLabel);

  return normalizedLabel === '' || normalizedLabel === defaultLabel
    ? null
    : normalizedLabel;
};
