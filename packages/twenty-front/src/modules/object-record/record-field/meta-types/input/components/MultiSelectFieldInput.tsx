import { useMultiSelectField } from '@/object-record/record-field/meta-types/hooks/useMultiSelectField';
import { MultiSelectInput } from '@/ui/field/input/components/MultiSelectInput';

type MultiSelectFieldInputProps = {
  onCancel?: () => void;
};

export const MultiSelectFieldInput = ({
  onCancel,
}: MultiSelectFieldInputProps) => {
  const { persistField, fieldDefinition, fieldValues, hotkeyScope } =
    useMultiSelectField();

  return (
    <MultiSelectInput
      hotkeyScope={hotkeyScope}
      options={fieldDefinition.metadata.options}
      onCancel={onCancel}
      onOptionSelected={persistField}
      values={fieldValues}
    />
  );
};
