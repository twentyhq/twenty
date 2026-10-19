import { type VariablePickerComponent } from '@/ui/input/types/VariablePickerComponent';
import { WorkflowVariablesDropdown } from '@/workflow/workflow-variables/components/WorkflowVariablesDropdown';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledSearchVariablesDropdownContainer = styled.div<{
  isReadonly?: boolean;
  multiline?: boolean;
}>`
  align-items: center;
  background-color: ${({ multiline }) =>
    multiline
      ? 'transparent'
      : themeCssVariables.background.transparent.lighter};
  border: ${({ multiline }) =>
    multiline ? 'none' : `1px solid ${themeCssVariables.border.color.medium}`};

  border-radius: ${({ multiline }) =>
    multiline
      ? themeCssVariables.border.radius.sm
      : `0 ${themeCssVariables.border.radius.sm} ${themeCssVariables.border.radius.sm} 0`};

  display: flex;
  height: ${({ multiline }) =>
    multiline ? themeCssVariables.spacing[7] : 'auto'};

  justify-content: center;
  margin: ${({ multiline }) =>
    multiline ? `${themeCssVariables.spacing[1]}` : '0'};

  position: ${({ multiline }) => (multiline ? 'absolute' : 'static')};
  right: ${({ multiline }) =>
    multiline ? themeCssVariables.spacing[0] : 'auto'};
  top: ${({ multiline }) =>
    multiline ? themeCssVariables.spacing[0] : 'auto'};
  width: ${({ multiline }) =>
    multiline ? themeCssVariables.spacing[7] : 'auto'};

  &:has([data-popup-open]) {
    background-color: ${themeCssVariables.background.transparent.light};
  }

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

  &:has([data-popup-open]):hover {
    background-color: ${themeCssVariables.background.transparent.medium};
  }
`;

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
    <StyledSearchVariablesDropdownContainer
      isReadonly={disabled}
      multiline={multiline}
    >
      <WorkflowVariablesDropdown
        instanceId={instanceId}
        onVariableSelect={onVariableSelect}
        disabled={disabled}
        shouldDisplayRecordObjects={shouldDisplayRecordObjects}
        shouldDisplayRecordFields={shouldDisplayRecordFields}
        objectNameSingularsToSelect={objectNameSingularsToSelect}
      />
    </StyledSearchVariablesDropdownContainer>
  );
};
