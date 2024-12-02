import styled from '@emotion/styled';
import { Editor, EditorContent } from '@tiptap/react';

const StyledEditor = styled.div<{ multiline?: boolean; readonly?: boolean }>`
  width: 100%;
  display: flex;
  box-sizing: border-box;
  padding-right: ${({ multiline, theme }) =>
    multiline ? theme.spacing(4) : undefined};

  .editor-content {
    width: 100%;
  }

  .tiptap {
    padding: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(2)}`};
    box-sizing: border-box;
    display: flex;
    height: 100%;
    overflow: ${({ multiline }) => (multiline ? 'auto' : 'hidden')};
    color: ${({ theme, readonly }) =>
      readonly ? theme.font.color.light : theme.font.color.primary};
    font-family: ${({ theme }) => theme.font.family};
    font-weight: ${({ theme }) => theme.font.weight.regular};
    border: none !important;
    align-items: ${({ multiline }) => (multiline ? 'top' : 'center')};
    white-space: ${({ multiline }) => (multiline ? 'pre' : 'nowrap')};

    p.is-editor-empty:first-of-type::before {
      content: attr(data-placeholder);
      color: ${({ theme }) => theme.font.color.light};
      font-weight: ${({ theme }) => theme.font.weight.medium};
      float: left;
      height: 0;
      pointer-events: none;
    }

    p {
      margin: 0;
    }

    .variable-tag {
      background-color: ${({ theme }) => theme.color.blue10};
      border-radius: ${({ theme }) => theme.border.radius.sm};
      color: ${({ theme }) => theme.color.blue};
      padding: ${({ theme }) => theme.spacing(1)};
    }
  }

  .ProseMirror-focused {
    outline: none;
  }
`;

type TextVariableEditorProps = {
  multiline: boolean | undefined;
  readonly: boolean | undefined;
  editor: Editor;
};

export const TextVariableEditor = ({
  multiline,
  readonly,
  editor,
}: TextVariableEditorProps) => {
  return (
    <StyledEditor multiline={multiline} readonly={readonly}>
      <EditorContent className="editor-content" editor={editor} />
    </StyledEditor>
  );
};
