import { useMultiSelectField } from '@/object-record/record-field/meta-types/hooks/useMultiSelectField.ts';
import { Tag } from '@/ui/display/tag/components/Tag';

export const MultiSelectFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useMultiSelectField();

  // TODO: use values
  const selectedOption = fieldDefinition.metadata.options[0];

  return selectedOption ? (
    <Tag color={selectedOption.color} text={selectedOption.label} />
  ) : (
    <></>
  );
};
