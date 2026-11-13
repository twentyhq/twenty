import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { splitSelectOptionsByIsActive } from '@/settings/data-model/fields/forms/select/utils/splitSelectOptionsByIsActive';

const withPositions = (options: FieldMetadataItemOption[]) =>
  options.map((option, position) => ({ ...option, position }));

export const setSelectOptionIsActive = ({
  options,
  optionId,
  isActive,
}: {
  options: FieldMetadataItemOption[];
  optionId: string;
  isActive: boolean;
}): FieldMetadataItemOption[] => {
  const optionsWithUpdatedOption = options.map(
    (option): FieldMetadataItemOption => {
      if (option.id !== optionId) {
        return option;
      }

      const { isActive: _isActive, ...activeOption } = option;

      return isActive ? activeOption : { ...activeOption, isActive: false };
    },
  );
  const updatedOption = optionsWithUpdatedOption.filter(
    (option) => option.id === optionId,
  );
  const { activeOptions, inactiveOptions } = splitSelectOptionsByIsActive(
    optionsWithUpdatedOption.filter((option) => option.id !== optionId),
  );

  if (isActive) {
    return withPositions([
      ...activeOptions,
      ...updatedOption,
      ...inactiveOptions,
    ]);
  }

  return withPositions([
    ...activeOptions,
    ...inactiveOptions,
    ...updatedOption,
  ]);
};
