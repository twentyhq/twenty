import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { WorkflowVariablesDropdown } from '@/workflow/workflow-variables/components/WorkflowVariablesDropdown';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledSearchVariablesDropdownContainer = styled.div<{
  multiline?: boolean;
  isReadonly?: boolean;
}>`
  align-items: center;
  display: flex;
  justify-content: center;

  background-color: ${({ multiline }) =>
    multiline
      ? 'transparent'
      : themeCssVariables.background.transparent.lighter};

  border-radius: ${({ multiline }) =>
    multiline
      ? themeCssVariables.border.radius.sm
      : `0 ${themeCssVariables.border.radius.sm} ${themeCssVariables.border.radius.sm} 0`};

  border: ${({ multiline }) =>
    multiline ? 'none' : `1px solid ${themeCssVariables.border.color.medium}`};

  padding: ${({ multiline }) =>
    multiline
      ? `${themeCssVariables.spacing[0.5]} ${themeCssVariables.spacing[0]}`
      : '0'};

  position: ${({ multiline }) => (multiline ? 'absolute' : 'static')};
  right: ${({ multiline }) =>
    multiline ? themeCssVariables.spacing[0] : 'auto'};
  top: ${({ multiline }) =>
    multiline ? themeCssVariables.spacing[0] : 'auto'};

  &:hover {
    background-color: ${({ isReadonly, multiline }) => {
      if (isReadonly === true) {
        return multiline
          ? 'transparent'
          : themeCssVariables.background.transparent.lighter;
      }
      return themeCssVariables.background.transparent.light;
    }};
  }
`;

export const WorkflowVariablePicker: VariablePickerComponent = ({
  instanceId,
  disabled,
  multiline,
  onVariableSelect,
  shouldDisplayRecordObjects = false,
  shouldDisplayRecordFields = true,
}) => {
  return (
    <StyledSearchVariablesDropdownContainer
      multiline={multiline}
      isReadonly={disabled}
    >
      <WorkflowVariablesDropdown
        instanceId={instanceId}
        onVariableSelect={onVariableSelect}
        disabled={disabled}
        shouldDisplayRecordObjects={shouldDisplayRecordObjects}
        shouldDisplayRecordFields={shouldDisplayRecordFields}
        multiline={multiline}
      />
    </StyledSearchVariablesDropdownContainer>
  );
};
