import { ImageBubbleMenu } from '@/advanced-text-editor/components/ImageBubbleMenu';
import { LinkBubbleMenu } from '@/advanced-text-editor/components/LinkBubbleMenu';
import { TextBubbleMenu } from '@/advanced-text-editor/components/TextBubbleMenu';
import { FORM_FIELD_PLACEHOLDER_STYLES } from '@/object-record/record-field/ui/form-types/constants/FormFieldPlaceholderStyles';
import { styled } from '@linaria/react';
import { EditorContent, type Editor } from '@tiptap/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledEditorContainer = styled.div<{
  readonly?: boolean;
  minHeight: number;
  maxWidth: number;
}>`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;

  .editor-content {
    flex-grow: 1;
    height: 100%;
    min-height: ${({ minHeight }) => minHeight}px;
    width: 100%;
  }

  .tiptap {
    border: none !important;
    box-sizing: border-box;
    color: ${({ readonly }) =>
      readonly
        ? themeCssVariables.font.color.secondary
        : themeCssVariables.font.color.primary};
    font-family: ${themeCssVariables.font.family};
    font-size: ${themeCssVariables.font.size.sm};
    font-weight: ${themeCssVariables.font.weight.regular};
    height: 100%;
    padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};

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
      background-color: ${themeCssVariables.color.blue3};
      border-radius: ${themeCssVariables.border.radius.sm};
      color: ${themeCssVariables.color.blue};
      padding: ${themeCssVariables.spacing[1]};
    }

    h1 {
      font-size: 1.5em;
    }

    h2 {
      font-size: 1.3em;
    }

    h3 {
      font-size: 1.1em;
    }

    li {
      line-height: 1.5;
      margin-bottom: ${themeCssVariables.spacing[2]};
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
