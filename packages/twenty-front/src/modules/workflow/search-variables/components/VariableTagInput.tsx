import {
  StyledInputContainer,
  StyledInputContainer2,
} from '@/object-record/record-field/form-types/components/FormFieldInputBase';
import { TextVariableEditor } from '@/object-record/record-field/form-types/components/TextVariableEditor';
import { useTextVariableEditor } from '@/object-record/record-field/form-types/hooks/useTextVariableEditor';
import SearchVariablesDropdown from '@/workflow/search-variables/components/SearchVariablesDropdown';
import { parseEditorContent } from '@/workflow/search-variables/utils/parseEditorContent';
import styled from '@emotion/styled';
import { useDebouncedCallback } from 'use-debounce';

const StyledContainer = styled.div`
  display: inline-flex;
  flex-direction: column;
`;

const StyledLabel = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
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

interface VariableTagInputProps {
  inputId: string;
  label?: string;
  value?: string;
  placeholder?: string;
  multiline?: boolean;
  onChange?: (content: string) => void;
  readonly?: boolean;
}

export const VariableTagInput = ({
  inputId,
  label,
  value,
  placeholder,
  multiline,
  onChange,
  readonly,
}: VariableTagInputProps) => {
  const deboucedOnUpdate = useDebouncedCallback((editor) => {
    const jsonContent = editor.getJSON();
    const parsedContent = parseEditorContent(jsonContent);
    onChange?.(parsedContent);
  }, 500);

  const editor = useTextVariableEditor({
    placeholder,
    multiline,
    readonly,
    defaultValue: value,
    onUpdate: deboucedOnUpdate,
  });

  if (!editor) {
    return null;
  }

  return (
    <StyledContainer>
      {label && <StyledLabel>{label}</StyledLabel>}
      <StyledInputContainer multiline={multiline}>
        <StyledInputContainer2 multiline={multiline} readonly={readonly}>
          <TextVariableEditor
            editor={editor}
            multiline={multiline}
            readonly={readonly}
          />
        </StyledInputContainer2>

        <StyledSearchVariablesDropdownContainer
          multiline={multiline}
          readonly={readonly}
        >
          <SearchVariablesDropdown
            inputId={inputId}
            insertVariableTag={(variable) => {
              editor.commands.insertVariableTag(variable);
            }}
            disabled={readonly}
          />
        </StyledSearchVariablesDropdownContainer>
      </StyledInputContainer>
    </StyledContainer>
  );
};

export default VariableTagInput;
