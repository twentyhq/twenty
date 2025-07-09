import { useMultiSelectField } from '@/object-record/record-field/meta-types/hooks/useMultiSelectField';
import { SELECT_FIELD_INPUT_SELECTABLE_LIST_COMPONENT_INSTANCE_ID } from '@/object-record/record-field/meta-types/input/constants/SelectFieldInputSelectableListComponentInstanceId';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/states/contexts/RecordFieldComponentInstanceContext';
import { MultiSelectInput } from '@/ui/field/input/components/MultiSelectInput';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';

type MultiSelectFieldInputProps = {
  onCancel?: () => void;
};

export const MultiSelectFieldInput = ({
  onCancel,
}: MultiSelectFieldInputProps) => {
  const { persistField, fieldDefinition, fieldValues } = useMultiSelectField();

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  return (
    <MultiSelectInput
      selectableListComponentInstanceId={
        SELECT_FIELD_INPUT_SELECTABLE_LIST_COMPONENT_INSTANCE_ID
      }
      focusId={instanceId}
      options={fieldDefinition.metadata.options}
      onCancel={onCancel}
      onOptionSelected={persistField}
      values={fieldValues}
    />
  );
};
