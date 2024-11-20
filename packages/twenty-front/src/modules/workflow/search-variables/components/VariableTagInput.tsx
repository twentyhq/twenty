import SearchVariablesDropdown from '@/workflow/search-variables/components/SearchVariablesDropdown';
import { initializeEditorContent } from '@/workflow/search-variables/utils/initializeEditorContent';
import { parseEditorContent } from '@/workflow/search-variables/utils/parseEditorContent';
import { VariableTag } from '@/workflow/search-variables/utils/variableTag';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import Document from '@tiptap/extension-document';
import HardBreak from '@tiptap/extension-hard-break';
import Paragraph from '@tiptap/extension-paragraph';
import Placeholder from '@tiptap/extension-placeholder';
import Text from '@tiptap/extension-text';
import { EditorContent, useEditor } from '@tiptap/react';
import { isDefined, ThemeType } from 'twenty-ui';
import { useDebouncedCallback } from 'use-debounce';

const LINE_HEIGHT = 24;

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

export const VARIABLE_TAG_STYLES = ({ theme }: { theme: ThemeType }) => css`
  background-color: ${theme.color.blue10};
  border-radius: ${theme.border.radius.sm};
  color: ${theme.color.blue};
  padding: ${theme.spacing(1)};
`;

const StyledEditor = styled.div<{ multiline?: boolean; readonly?: boolean }>`
  display: flex;
  width: 100%;
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-bottom-left-radius: ${({ theme }) => theme.border.radius.sm};
  border-top-left-radius: ${({ theme }) => theme.border.radius.sm};
  box-sizing: border-box;
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  padding: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(2)}`};
  border-bottom-right-radius: ${({ multiline, theme }) =>
    multiline ? theme.border.radius.sm : 'none'};
  border-top-right-radius: ${({ multiline, theme }) =>
    multiline ? theme.border.radius.sm : 'none'};
  border-right: ${({ multiline }) => (multiline ? 'auto' : 'none')};
  padding-right: ${({ multiline, theme }) =>
    multiline ? theme.spacing(6) : theme.spacing(2)};
  overflow: ${({ multiline }) => (multiline ? 'auto' : 'hidden')};
  height: ${({ multiline }) => (multiline ? 'auto' : `${1.5 * LINE_HEIGHT}px`)};

  .editor-content {
    width: 100%;
  }

  .tiptap {
    display: flex;
    height: 100%;
    color: ${({ theme, readonly }) =>
      readonly ? theme.font.color.light : theme.font.color.primary};
    font-family: ${({ theme }) => theme.font.family};
    font-weight: ${({ theme }) => theme.font.weight.regular};
    border: none !important;
    align-items: ${({ multiline }) => (multiline ? 'top' : 'center')};
    white-space: ${({ multiline }) => (multiline ? 'pre-wrap' : 'nowrap')};
    word-wrap: ${({ multiline }) => (multiline ? 'break-word' : 'normal')};

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
      ${VARIABLE_TAG_STYLES}
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

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Placeholder.configure({
        placeholder,
      }),
      VariableTag,
      ...(multiline
        ? [
            HardBreak.configure({
              keepMarks: false,
            }),
          ]
        : []),
    ],
    editable: !readonly,
    onCreate: ({ editor }) => {
      if (isDefined(value)) {
        initializeEditorContent(editor, value);
      }
    },
    onUpdate: ({ editor }) => {
      deboucedOnUpdate(editor);
    },
    editorProps: {
      handleKeyDown: (view, event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();

          const { state } = view;
          const { tr } = state;

          // Insert hard break using the view's state and dispatch
          const transaction = tr.replaceSelectionWith(
            state.schema.nodes.hardBreak.create(),
          );

          view.dispatch(transaction);

          return true;
        }
        return false;
      },
    },
    enableInputRules: false,
    enablePasteRules: false,
    injectCSS: false,
  });

  if (!editor) {
    return null;
  }

  return (
    <StyledContainer>
      {label && <StyledLabel>{label}</StyledLabel>}
      <StyledInputContainer multiline={multiline}>
        <StyledEditor multiline={multiline} readonly={readonly}>
          <EditorContent className="editor-content" editor={editor} />
        </StyledEditor>
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
