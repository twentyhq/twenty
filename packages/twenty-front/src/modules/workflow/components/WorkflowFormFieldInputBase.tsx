import { FormFieldInputBase } from '@/object-record/record-field/form-types/components/FormFieldInputBase';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import SearchVariablesDropdown from '@/workflow/search-variables/components/SearchVariablesDropdown';
import { extractVariableLabel } from '@/workflow/search-variables/utils/extractVariableLabel';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { isString } from '@sniptt/guards';
import { useId, useState } from 'react';

const StyledVariableContainer = styled.div`
  align-items: center;
  display: flex;
`;

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

type VariableMode = 'static-or-variable' | 'full-editor';

type EditingMode = 'input' | 'variable';

type WorkflowFormFieldInputBaseProps<T> = {
  inputId?: string;
  label?: string;
  variableMode: VariableMode;
  onVariableTagInsert: (variable: string) => void;
  Input: React.ReactElement;
  multiline?: boolean;
  readonly?: boolean;
} & (
  | {
      variableMode: 'static-or-variable';
      draftValue: T;
      onUnlinkVariable: () => void;
    }
  | {
      variableMode: 'full-editor';
      draftValue?: never;
      onUnlinkVariable?: never;
    }
);

export const WorkflowFormFieldInputBase = ({
  inputId,
  label,
  Input,
  onVariableTagInsert,
  variableMode,
  draftValue,
  multiline,
  onUnlinkVariable,
  readonly,
}: WorkflowFormFieldInputBaseProps<unknown>) => {
  const variablesDropdownId = useId();

  const [editingMode, setEditingMode] = useState<EditingMode>(() => {
    return isString(draftValue) && draftValue.startsWith('{{')
      ? 'variable'
      : 'input';
  });

  return (
    <FormFieldInputBase
      inputId={inputId}
      label={label}
      Input={
        variableMode === 'full-editor' || editingMode === 'input' ? (
          Input
        ) : (
          <StyledVariableContainer>
            <SortOrFilterChip
              labelValue={extractVariableLabel(draftValue as string)}
              onRemove={() => {
                setEditingMode('input');
                onUnlinkVariable();
              }}
            />
          </StyledVariableContainer>
        )
      }
      RightElement={
        <StyledSearchVariablesDropdownContainer
          multiline={multiline}
          readonly={readonly}
        >
          <SearchVariablesDropdown
            inputId={variablesDropdownId}
            insertVariableTag={(variable) => {
              setEditingMode('variable');
              onVariableTagInsert(variable);
            }}
            disabled={readonly}
          />
        </StyledSearchVariablesDropdownContainer>
      }
      multiline={multiline}
    />
  );
};
