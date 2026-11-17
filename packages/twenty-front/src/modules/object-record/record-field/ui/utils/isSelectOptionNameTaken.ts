import { computeOptionValueFromLabel } from '@/object-metadata/utils/computeOptionValueFromLabel';

// Inactive options are hidden from pickers but still hold their value and label.
export const isSelectOptionNameTaken = ({
  options,
  optionName,
}: {
  options: { label: string; value: string }[];
  optionName: string;
}): boolean => {
  const optionValue = computeOptionValueFromLabel(optionName);
  const optionLabel = optionName.toLowerCase();

  return options.some(
    (option) =>
      option.value === optionValue ||
      option.label.toLowerCase() === optionLabel,
  );
};
