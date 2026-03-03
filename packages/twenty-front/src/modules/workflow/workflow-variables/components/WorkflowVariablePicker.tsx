import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { WorkflowVariablesDropdown } from '@/workflow/workflow-variables/components/WorkflowVariablesDropdown';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { css } from '@linaria/core';

export const StyledSearchVariablesDropdownContainer = styled.div<{
  multiline?: boolean;
  readonly?: boolean;
}>`
  align-items: center;
  display: flex;
  justify-content: center;

  ${({ readonly }) =>
    !readonly
      ? css`
          :hover {
            background-color: ${themeCssVariables.background.transparent.light};
          }
        `
      : ''}

  ${({ multiline }) =>
    multiline
      ? css`
          border-radius: ${themeCssVariables.border.radius.sm};
          padding: ${themeCssVariables.spacing[0.5]}
            ${themeCssVariables.spacing[0]};
          position: absolute;
          right: ${themeCssVariables.spacing[0]};
          top: ${themeCssVariables.spacing[0]};
        `
      : css`
          background-color: ${themeCssVariables.background.transparent.lighter};
          border-top-right-radius: ${themeCssVariables.border.radius.sm};
          border-bottom-right-radius: ${themeCssVariables.border.radius.sm};
          border: 1px solid ${themeCssVariables.border.color.medium};
        `}
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
      readonly={disabled}
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
