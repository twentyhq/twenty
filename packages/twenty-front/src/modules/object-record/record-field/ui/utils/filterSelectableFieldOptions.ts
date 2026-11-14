import { isFieldMetadataOptionActive } from 'twenty-shared/utils';

// An inactive option already on the record stays listed so it can be displayed and removed.
export const filterSelectableFieldOptions = <
  TOption extends { value: string; isActive?: boolean | null },
>({
  options,
  selectedValues,
}: {
  options: TOption[];
  selectedValues: readonly string[];
}): TOption[] =>
  options.filter(
    (option) =>
      isFieldMetadataOptionActive(option) ||
      selectedValues.includes(option.value),
  );
