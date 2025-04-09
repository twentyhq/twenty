import { useMultiSelectField } from '@/object-record/record-field/meta-types/hooks/useMultiSelectField';
import { SELECT_FIELD_INPUT_SELECTABLE_LIST_COMPONENT_INSTANCE_ID } from '@/object-record/record-field/meta-types/input/constants/SelectFieldInputSelectableListComponentInstanceId';
import { DEFAULT_CELL_SCOPE } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellV2';
import { MultiSelectInput } from '@/ui/field/input/components/MultiSelectInput';

type MultiSelectFieldInputProps = {
  onCancel?: () => void;
};

export const MultiSelectFieldInput = ({
  onCancel,
}: MultiSelectFieldInputProps) => {
  const { persistField, fieldDefinition, fieldValues } = useMultiSelectField();

  return (
    <MultiSelectInput
      selectableListComponentInstanceId={
        SELECT_FIELD_INPUT_SELECTABLE_LIST_COMPONENT_INSTANCE_ID
      }
      hotkeyScope={DEFAULT_CELL_SCOPE.scope}
      options={fieldDefinition.metadata.options}
      onCancel={onCancel}
      onOptionSelected={persistField}
      values={fieldValues}
    />
  );
};
