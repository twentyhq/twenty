import { useMultiSelectField } from '@/object-record/record-field/meta-types/hooks/useMultiSelectField.ts';
import { Tag } from '@/ui/display/tag/components/Tag';

export const MultiSelectFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useMultiSelectField();

  const selectedOptions = fieldValue
    ? fieldDefinition.metadata.options.filter((option) =>
        fieldValue.includes(option.value),
      )
    : [];

  return selectedOptions ? (
    <>
      {selectedOptions.map((selectedOption) => (
        <Tag color={selectedOption.color} text={selectedOption.label} />
      ))}
    </>
  ) : (
    <></>
  );
};
