// A label left empty or set back to the default header means the column has no custom label
export const getRecordFieldCustomLabel = ({
  editedLabel,
  defaultLabel,
}: {
  editedLabel: string;
  defaultLabel: string;
}): string | null => {
  const trimmedLabel = editedLabel.trim();

  return trimmedLabel === '' || trimmedLabel === defaultLabel
    ? null
    : trimmedLabel;
};
