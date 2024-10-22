import SearchVariablesDropdown from '@/workflow/search-variables/components/SearchVariablesDropdown';
import { getVariableTag } from '@/workflow/search-variables/utils/getVariableTag';
import { initializeEditorContent } from '@/workflow/search-variables/utils/initializeEditorContent';
import { parseEditorContent } from '@/workflow/search-variables/utils/parseEditorContent';
import styled from '@emotion/styled';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Placeholder from '@tiptap/extension-placeholder';
import Text from '@tiptap/extension-text';
import { EditorContent, useEditor } from '@tiptap/react';
import { isDefined } from 'twenty-ui';

const StyledContainer = styled.div`
  display: inline-flex;
  flex-direction: column;
`;

const StyledLabel = styled.label`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledInputContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const StyledSearchVariablesDropdownContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border-top-right-radius: ${({ theme }) => theme.border.radius.sm};
  border-bottom-right-radius: ${({ theme }) => theme.border.radius.sm};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
`;

const StyledEditor = styled.div`
  display: flex;
  height: 32px;
  width: 100%;
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-bottom-left-radius: ${({ theme }) => theme.border.radius.sm};
  border-top-left-radius: ${({ theme }) => theme.border.radius.sm};
  border-right: none;
  box-sizing: border-box;
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing(2)};

  .editor-content {
    width: 100%;
  }

  .tiptap {
    display: flex;
    align-items: center;
    height: 100%;
    color: ${({ theme }) => theme.font.color.primary};
    font-family: ${({ theme }) => theme.font.family};
    font-weight: ${({ theme }) => theme.font.weight.regular};
    border: none !important;
    white-space: nowrap;

    p.is-editor-empty:first-of-type::before {
      content: attr(data-placeholder);
      color: ${({ theme }) => theme.font.color.light};
      float: left;
      height: 0;
      pointer-events: none;
    }

    p {
      margin: 0;
    }

    .variable-tag {
      color: ${({ theme }) => theme.color.blue};
      background-color: ${({ theme }) => theme.color.blue10};
      padding: ${({ theme }) => theme.spacing(1)};
      border-radius: ${({ theme }) => theme.border.radius.sm};
    }
  }

  .ProseMirror-focused {
    outline: none;
  }
`;

interface VariableTagInputProps {
  inputId: string;
  label?: string;
  value?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
}

export const VariableTagInput = ({
  inputId,
  label,
  value,
  placeholder,
  onChange,
}: VariableTagInputProps) => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      getVariableTag(),
      Placeholder.configure({
        placeholder,
      }),
    ],
    editable: true,
    onCreate: ({ editor }) => {
      if (isDefined(value)) {
        initializeEditorContent(editor, value);
      }
    },
    onUpdate: ({ editor }) => {
      const jsonContent = editor.getJSON();
      const parsedContent = parseEditorContent(jsonContent);
      onChange?.(parsedContent);
    },
  });

  const insertVariableTag = (variable: string) => {
    // @ts-expect-error - insertVariableTag is missing from the EditorCommands type but it is defined in the VariableTag extension
    editor.commands.insertVariableTag(variable);
  };

  if (!editor) {
    return null;
  }

  return (
    <StyledContainer>
      {label && <StyledLabel>{label}</StyledLabel>}
      <StyledInputContainer>
        <StyledEditor>
          <EditorContent className="editor-content" editor={editor} />
        </StyledEditor>
        <StyledSearchVariablesDropdownContainer>
          <SearchVariablesDropdown
            inputId={inputId}
            onSelect={(variable: string) => insertVariableTag(variable)}
          />
        </StyledSearchVariablesDropdownContainer>
      </StyledInputContainer>
    </StyledContainer>
  );
};

export default VariableTagInput;
