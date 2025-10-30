import { ImageBubbleMenu } from '@/advanced-text-editor/components/ImageBubbleMenu';
import { LinkBubbleMenu } from '@/advanced-text-editor/components/LinkBubbleMenu';
import { TextBubbleMenu } from '@/advanced-text-editor/components/TextBubbleMenu';
import { FORM_FIELD_PLACEHOLDER_STYLES } from '@/object-record/record-field/ui/form-types/constants/FormFieldPlaceholderStyles';
import styled from '@emotion/styled';
import { EditorContent, type Editor } from '@tiptap/react';

const StyledEditorContainer = styled.div<{
  readonly?: boolean;
  minHeight: number;
  maxWidth: number;
}>`
  height: 100%;
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;

  .editor-content {
    flex-grow: 1;
    width: 100%;
    height: 100%;
    min-height: ${({ minHeight }) => minHeight}px;
  }

  .tiptap {
    padding: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(2)}`};
    box-sizing: border-box;
    height: 100%;
    color: ${({ theme, readonly }) =>
      readonly ? theme.font.color.light : theme.font.color.primary};
    font-family: ${({ theme }) => theme.font.family};
    font-weight: ${({ theme }) => theme.font.weight.regular};
    border: none !important;

    p.is-editor-empty:first-of-type::before {
      ${FORM_FIELD_PLACEHOLDER_STYLES}
      content: attr(data-placeholder);
      float: left;
      height: 0;
      pointer-events: none;
    }

    p {
      line-height: 1.5;
      margin: 0;
    }

    .variable-tag {
      background-color: ${({ theme }) => theme.color.blue3};
      border-radius: ${({ theme }) => theme.border.radius.sm};
      color: ${({ theme }) => theme.color.blue};
      padding: ${({ theme }) => theme.spacing(1)};
    }

    h1 {
      font-size: 32px;
    }

    h2 {
      font-size: 24px;
    }

    h3 {
      font-size: 16px;
    }

    li {
      margin-bottom: ${({ theme }) => theme.spacing(2)};
      line-height: 1.5;
    }
  }

  .ProseMirror-focused {
    outline: none;
  }

  .ProseMirror-hideselection * {
    caret-color: transparent;
  }
`;

type AdvancedTextEditorProps = {
  readonly: boolean | undefined;
  editor: Editor;
  minHeight: number;
  maxWidth: number;
};

export const AdvancedTextEditor = ({
  readonly,
  editor,
  minHeight,
  maxWidth,
}: AdvancedTextEditorProps) => {
  return (
    <StyledEditorContainer
      readonly={readonly}
      minHeight={minHeight}
      maxWidth={maxWidth}
    >
      <EditorContent className="editor-content" editor={editor} />
      <ImageBubbleMenu editor={editor} />
      <TextBubbleMenu editor={editor} />
      <LinkBubbleMenu editor={editor} />
    </StyledEditorContainer>
  );
};
