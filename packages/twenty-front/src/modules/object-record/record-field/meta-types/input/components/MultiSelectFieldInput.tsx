import { useMultiSelectField } from '@/object-record/record-field/meta-types/hooks/useMultiSelectField';
import { SELECT_FIELD_INPUT_SELECTABLE_LIST_COMPONENT_INSTANCE_ID } from '@/object-record/record-field/meta-types/input/constants/SelectFieldInputSelectableListComponentInstanceId';
import { getFieldInputInstanceId } from '@/object-record/record-field/utils/getFieldInputInstanceId';
import { MultiSelectInput } from '@/ui/field/input/components/MultiSelectInput';

type MultiSelectFieldInputProps = {
  onCancel?: () => void;
};

export const MultiSelectFieldInput = ({
  onCancel,
}: MultiSelectFieldInputProps) => {
  const { persistField, fieldDefinition, fieldValues, recordId } =
    useMultiSelectField();

  return (
    <MultiSelectInput
      selectableListComponentInstanceId={
        SELECT_FIELD_INPUT_SELECTABLE_LIST_COMPONENT_INSTANCE_ID
      }
      focusId={getFieldInputInstanceId({
        recordId,
        fieldName: fieldDefinition.metadata.fieldName,
      })}
      options={fieldDefinition.metadata.options}
      onCancel={onCancel}
      onOptionSelected={persistField}
      values={fieldValues}
    />
  );
};
