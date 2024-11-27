import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { StyledSearchVariablesDropdownContainer } from '@/workflow/components/WorkflowFormFieldInputBase';
import SearchVariablesDropdown from '@/workflow/search-variables/components/SearchVariablesDropdown';

export const WorkflowVariablePicker: VariablePickerComponent = ({
  inputId,
  disabled,
  multiline,
  onVariableSelect,
}) => {
  return (
    <StyledSearchVariablesDropdownContainer
      multiline={multiline}
      readonly={disabled}
    >
      <SearchVariablesDropdown
        inputId={inputId}
        onVariableSelect={onVariableSelect}
        disabled={disabled}
      />
    </StyledSearchVariablesDropdownContainer>
  );
};
