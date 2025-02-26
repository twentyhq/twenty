import { useMultiSelectField } from '@/object-record/record-field/meta-types/hooks/useMultiSelectField';
import { SELECT_FIELD_INPUT_SELECTABLE_LIST_COMPONENT_INSTANCE_ID } from '@/object-record/record-field/meta-types/input/constants/SelectFieldInputSelectableListComponentInstanceId';
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
      selectableListComponentInstanceId={
        SELECT_FIELD_INPUT_SELECTABLE_LIST_COMPONENT_INSTANCE_ID
      }
      hotkeyScope={hotkeyScope}
      options={fieldDefinition.metadata.options}
      onCancel={onCancel}
      onOptionSelected={persistField}
      values={fieldValues}
    />
  );
};
