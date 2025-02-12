import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { WorkflowVariablesDropdown } from '@/workflow/workflow-variables/components/WorkflowVariablesDropdown';
import { css } from '@emotion/react';
import styled from '@emotion/styled';

export const StyledSearchVariablesDropdownContainer = styled.div<{
  multiline?: boolean;
  readonly?: boolean;
}>`
  align-items: center;
  display: flex;
  justify-content: center;

  ${({ theme, readonly }) =>
    !readonly &&
    css`
      :hover {
        background-color: ${theme.background.transparent.light};
      }
    `}

  ${({ theme, multiline }) =>
    multiline
      ? css`
          border-radius: ${theme.border.radius.sm};
          padding: ${theme.spacing(0.5)} ${theme.spacing(0)};
          position: absolute;
          right: ${theme.spacing(0)};
          top: ${theme.spacing(0)};
        `
      : css`
          background-color: ${theme.background.transparent.lighter};
          border-top-right-radius: ${theme.border.radius.sm};
          border-bottom-right-radius: ${theme.border.radius.sm};
          border: 1px solid ${theme.border.color.medium};
        `}
`;

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
      <WorkflowVariablesDropdown
        inputId={inputId}
        onVariableSelect={onVariableSelect}
        disabled={disabled}
      />
    </StyledSearchVariablesDropdownContainer>
  );
};
