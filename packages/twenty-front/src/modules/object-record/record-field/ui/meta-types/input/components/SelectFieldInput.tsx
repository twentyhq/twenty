import { t } from '@lingui/core/macro';
import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useClearField } from '@/object-record/record-field/ui/hooks/useClearField';
import { useAddSelectOption } from '@/object-record/record-field/ui/meta-types/hooks/useAddSelectOption';
import { useCanAddSelectOption } from '@/object-record/record-field/ui/meta-types/hooks/useCanAddSelectOption';
import { useSelectField } from '@/object-record/record-field/ui/meta-types/hooks/useSelectField';
import { SELECT_FIELD_INPUT_SELECTABLE_LIST_COMPONENT_INSTANCE_ID } from '@/object-record/record-field/ui/meta-types/input/constants/SelectFieldInputSelectableListComponentInstanceId';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { SelectInput } from '@/ui/field/input/components/SelectInput';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useContext, useState } from 'react';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import { type SelectOption } from 'twenty-ui/input';

export const SelectFieldInput = () => {
  const { fieldDefinition, fieldValue } = useSelectField();
  const { addSelectOption } = useAddSelectOption(
    fieldDefinition?.metadata?.fieldName,
  );
  const { canAddSelectOption } = useCanAddSelectOption(
    fieldDefinition?.metadata?.fieldName,
  );

  const { onCancel, onSubmit } = useContext(FieldInputEventContext);

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  const [filteredOptions, setFilteredOptions] = useState<SelectOption[]>([]);

  const { resetSelectedItem } = useSelectableList(
    SELECT_FIELD_INPUT_SELECTABLE_LIST_COMPONENT_INSTANCE_ID,
  );
  const clearField = useClearField();

  const selectedOption = fieldDefinition.metadata.options.find(
    (option) => option.value === fieldValue,
  );
  // handlers
  const handleClearField = () => {
    clearField();
    onCancel?.();
  };

  const handleAddSelectOption = (optionName: string) => {
    if (!canAddSelectOption) {
      return;
    }
    addSelectOption(optionName);
  };

  const handleSubmit = (option: SelectOption) => {
    onSubmit?.({ newValue: option.value });

    resetSelectedItem();
  };

  useHotkeysOnFocusedElement({
    keys: [Key.Escape],
    callback: () => {
      onCancel?.();
      resetSelectedItem();
    },
    focusId: instanceId,
    dependencies: [onCancel, resetSelectedItem],
  });

  const fieldLabel = fieldDefinition.label;
  const optionIds = [
    t`No ${fieldLabel}`,
    ...filteredOptions.map((option) => option.value),
  ];

  return (
    <SelectInput
      selectableListComponentInstanceId={
        SELECT_FIELD_INPUT_SELECTABLE_LIST_COMPONENT_INSTANCE_ID
      }
      selectableItemIdArray={optionIds}
      focusId={instanceId}
      onEnter={(itemId) => {
        const option = filteredOptions.find(
          (option) => option.value === itemId,
        );
        if (isDefined(option)) {
          handleSubmit(option);
        }
      }}
      onOptionSelected={handleSubmit}
      options={fieldDefinition.metadata.options}
      onCancel={onCancel}
      defaultOption={selectedOption}
      onFilterChange={setFilteredOptions}
      onClear={
        fieldDefinition.metadata.isNullable ? handleClearField : undefined
      }
      clearLabel={fieldDefinition.label}
      onAddSelectOption={handleAddSelectOption}
    />
  );
};
