import { type VariablePickerComponent } from '@/ui/input/types/VariablePickerComponent';
import { WorkflowVariablesDropdown } from '@/workflow/workflow-variables/components/WorkflowVariablesDropdown';
import { VariablePickerContainer } from '@/ui/input/components/VariablePickerContainer';

export const WorkflowVariablePicker: VariablePickerComponent = ({
  instanceId,
  disabled,
  multiline,
  onVariableSelect,
  shouldDisplayRecordObjects = false,
  shouldDisplayRecordFields = true,
  objectNameSingularsToSelect,
}) => {
  return (
    <VariablePickerContainer isReadonly={disabled} multiline={multiline}>
      <WorkflowVariablesDropdown
        instanceId={instanceId}
        onVariableSelect={onVariableSelect}
        disabled={disabled}
        shouldDisplayRecordObjects={shouldDisplayRecordObjects}
        shouldDisplayRecordFields={shouldDisplayRecordFields}
        objectNameSingularsToSelect={objectNameSingularsToSelect}
      />
    </VariablePickerContainer>
  );
};
