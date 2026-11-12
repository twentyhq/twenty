import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';

// Active options come first, so the option joins the end of its new group.
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
  const otherOptions = optionsWithUpdatedOption.filter(
    (option) => option.id !== optionId,
  );
  const otherActiveOptions = otherOptions.filter(
    (option) => option.isActive !== false,
  );
  const otherInactiveOptions = otherOptions.filter(
    (option) => option.isActive === false,
  );

  return (
    isActive
      ? [...otherActiveOptions, ...updatedOption, ...otherInactiveOptions]
      : [...otherActiveOptions, ...otherInactiveOptions, ...updatedOption]
  ).map((option, position) => ({ ...option, position }));
};
