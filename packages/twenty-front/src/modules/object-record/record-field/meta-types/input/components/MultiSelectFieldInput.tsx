import { FieldInputEventContext } from '@/object-record/record-field/contexts/FieldInputEventContext';
import { useMultiSelectField } from '@/object-record/record-field/meta-types/hooks/useMultiSelectField';
import { SELECT_FIELD_INPUT_SELECTABLE_LIST_COMPONENT_INSTANCE_ID } from '@/object-record/record-field/meta-types/input/constants/SelectFieldInputSelectableListComponentInstanceId';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/states/contexts/RecordFieldComponentInstanceContext';
import { type FieldMultiSelectValue } from '@/object-record/record-field/types/FieldMetadata';

import { MultiSelectInput } from '@/ui/field/input/components/MultiSelectInput';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useContext } from 'react';

export const MultiSelectFieldInput = () => {
  const { fieldDefinition, draftValue, setDraftValue } = useMultiSelectField();

  const { onSubmit } = useContext(FieldInputEventContext);

  const handleOptionSelected = (newDraftValue: FieldMultiSelectValue) => {
    setDraftValue(newDraftValue);
  };

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  const handleCancel = () => {
    onSubmit?.({ newValue: draftValue });
  };

  return (
    <MultiSelectInput
      selectableListComponentInstanceId={
        SELECT_FIELD_INPUT_SELECTABLE_LIST_COMPONENT_INSTANCE_ID
      }
      focusId={instanceId}
      options={fieldDefinition.metadata.options}
      onCancel={handleCancel}
      onOptionSelected={handleOptionSelected}
      values={draftValue}
    />
  );
};
