import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import SearchVariablesDropdown from '@/workflow/search-variables/components/SearchVariablesDropdown';
import { extractVariableLabel } from '@/workflow/search-variables/utils/extractVariableLabel';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { isString } from '@sniptt/guards';
import { useId, useState } from 'react';

const LINE_HEIGHT = 24;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const StyledInputContainer = styled.div<{
  multiline?: boolean;
}>`
  display: flex;
  flex-direction: row;
  position: relative;
  line-height: ${({ multiline }) => (multiline ? `${LINE_HEIGHT}px` : 'auto')};
  min-height: ${({ multiline }) =>
    multiline ? `${3 * LINE_HEIGHT}px` : undefined};
  max-height: ${({ multiline }) =>
    multiline ? `${5 * LINE_HEIGHT}px` : undefined};
`;

export const StyledInputContainer2 = styled.div<{
  multiline?: boolean;
  readonly?: boolean;
}>`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-bottom-left-radius: ${({ theme }) => theme.border.radius.sm};
  border-bottom-right-radius: ${({ multiline, theme }) =>
    multiline ? theme.border.radius.sm : 'none'};
  border-right: ${({ multiline }) => (multiline ? 'auto' : 'none')};
  border-top-left-radius: ${({ theme }) => theme.border.radius.sm};
  border-top-right-radius: ${({ multiline, theme }) =>
    multiline ? theme.border.radius.sm : 'none'};
  box-sizing: border-box;
  display: flex;
  overflow: ${({ multiline }) => (multiline ? 'auto' : 'hidden')};
  width: 100%;
`;

const StyledVariableContainer = styled.div`
  align-items: center;
  display: flex;
`;

const StyledSearchVariablesDropdownContainer = styled.div<{
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

type EditingMode = 'input' | 'variable';

type VariableMode = 'static-or-variable' | 'full-editor';

type FormFieldInputProps<T> = {
  variableMode: VariableMode;
  onVariableTagInsert: (variable: string) => void;
  Input: React.ReactNode;
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

export const FormFieldInput = ({
  variableMode,
  draftValue,
  onVariableTagInsert,
  onUnlinkVariable,
  Input,
  multiline,
  readonly,
}: FormFieldInputProps<unknown>) => {
  const id = useId();

  const [editingMode, setEditingMode] = useState<EditingMode>(() => {
    return isString(draftValue) && draftValue.startsWith('{{')
      ? 'variable'
      : 'input';
  });

  return (
    <StyledContainer>
      <StyledInputContainer multiline={multiline}>
        <StyledInputContainer2 multiline={multiline}>
          {variableMode === 'full-editor' || editingMode === 'input' ? (
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
          )}
        </StyledInputContainer2>

        <StyledSearchVariablesDropdownContainer
          multiline={multiline}
          readonly={readonly}
        >
          <SearchVariablesDropdown
            inputId={id}
            insertVariableTag={(variable) => {
              setEditingMode('variable');
              onVariableTagInsert(variable);
            }}
            disabled={readonly}
          />
        </StyledSearchVariablesDropdownContainer>
      </StyledInputContainer>
    </StyledContainer>
  );
};
