import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import SearchVariablesDropdown from '@/workflow/search-variables/components/SearchVariablesDropdown';
import { extractVariableLabel } from '@/workflow/search-variables/utils/extractVariableLabel';
import styled from '@emotion/styled';
import { isString } from '@sniptt/guards';
import { useId, useState } from 'react';

const LINE_HEIGHT = 24;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledInputContainer = styled.div<{
  multiline?: boolean;
}>`
  display: flex;
  flex-direction: row;
  position: relative;
  line-height: ${({ multiline }) => (multiline ? `${LINE_HEIGHT}px` : 'auto')};
  min-height: ${({ multiline }) =>
    multiline ? `${3 * LINE_HEIGHT}px` : 'auto'};
  max-height: ${({ multiline }) =>
    multiline ? `${5 * LINE_HEIGHT}px` : 'auto'};
`;

const StyledInputContainer2 = styled.div<{
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
  height: ${({ multiline }) => (multiline ? 'auto' : `${1.5 * LINE_HEIGHT}px`)};
  overflow: ${({ multiline }) => (multiline ? 'auto' : 'hidden')};
  /* padding-right: ${({ multiline, theme }) =>
    multiline ? theme.spacing(6) : theme.spacing(2)}; */
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
    `
      :hover {
        background-color: ${theme.background.transparent.light};
      }`}

  ${({ theme, multiline }) =>
    multiline
      ? `
        position: absolute;
        top: ${theme.spacing(0)};
        right: ${theme.spacing(0)};
        padding: ${theme.spacing(0.5)} ${theme.spacing(0)};
        border-radius: ${theme.border.radius.sm};
      `
      : `
        background-color: ${theme.background.transparent.lighter};
        border-top-right-radius: ${theme.border.radius.sm};
        border-bottom-right-radius: ${theme.border.radius.sm};
        border: 1px solid ${theme.border.color.medium};
      `}
`;

type EditingMode = 'input' | 'variable';

type VariableMode = 'static-or-variable' | 'full-editor';

type FormFieldInputProps<T> = {
  draftValue: T;
  variableMode: VariableMode;
  onVariableTagInsert: (variable: string) => void;
  onUnlinkVariable: () => void;
  Input: React.ReactNode;
};

export const FormFieldInput = ({
  variableMode,
  draftValue,
  onVariableTagInsert,
  onUnlinkVariable,
  Input,
}: FormFieldInputProps<unknown>) => {
  const id = useId();

  const [editingMode, setEditingMode] = useState<EditingMode>(() => {
    return isString(draftValue) && draftValue.startsWith('{{')
      ? 'variable'
      : 'input';
  });

  return (
    <StyledContainer>
      <StyledInputContainer>
        <StyledInputContainer2>
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
          multiline={false}
          readonly={false}
        >
          <SearchVariablesDropdown
            inputId={id}
            insertVariableTag={(variable) => {
              setEditingMode('variable');
              onVariableTagInsert(variable);
            }}
            disabled={false}
          />
        </StyledSearchVariablesDropdownContainer>
      </StyledInputContainer>
    </StyledContainer>
  );
};
