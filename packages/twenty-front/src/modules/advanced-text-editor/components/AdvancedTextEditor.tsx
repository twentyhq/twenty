import { ImageBubbleMenu } from '@/advanced-text-editor/components/ImageBubbleMenu';
import { LinkBubbleMenu } from '@/advanced-text-editor/components/LinkBubbleMenu';
import { TextBubbleMenu } from '@/advanced-text-editor/components/TextBubbleMenu';
import { type AdvancedTextEditorComponentProps } from '@/advanced-text-editor/types/AdvancedTextEditorComponentProps';
import { hasEditorExtension } from '@/advanced-text-editor/utils/hasEditorExtension';
import { styled } from '@linaria/react';
import { EditorContent } from '@tiptap/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const PLACEHOLDER_STYLES = `
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledEditorContainer = styled.div<{
  readonly?: boolean;
  minHeight: number;
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
      ${PLACEHOLDER_STYLES}
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

    .block-section {
      border-radius: ${themeCssVariables.border.radius.sm};
      box-sizing: border-box;
      margin-bottom: ${themeCssVariables.spacing[2]};
      outline: 1px dashed transparent;
      outline-offset: 2px;

      &:hover {
        outline-color: ${themeCssVariables.border.color.medium};
      }
    }

    .block-columns {
      box-sizing: border-box;
      display: flex;
      gap: ${themeCssVariables.spacing[2]};
      margin-bottom: ${themeCssVariables.spacing[2]};
    }

    .block-column {
      border-radius: ${themeCssVariables.border.radius.sm};
      box-sizing: border-box;
      flex: 1;
      min-width: 0;
      outline: 1px dashed ${themeCssVariables.border.color.light};
      outline-offset: 2px;
    }

    .block-button-wrapper {
      margin-bottom: ${themeCssVariables.spacing[2]};
    }

    .block-button {
      box-sizing: border-box;
      cursor: text;
      width: fit-content;
    }

    .block-divider {
      border-bottom: none;
      border-left: none;
      border-right: none;
    }

    .ProseMirror-selectednode {
      outline: 2px solid ${themeCssVariables.color.blue};
    }
  }

  .ProseMirror-focused {
    outline: none;
  }

  .ProseMirror-hideselection * {
    caret-color: transparent;
  }
`;

const TEXT_BUBBLE_MENU_EXTENSION_NAMES = [
  'bold',
  'italic',
  'underline',
  'strike',
  'bulletList',
  'orderedList',
  'heading',
  'link',
];

type AdvancedTextEditorProps = AdvancedTextEditorComponentProps;

export const AdvancedTextEditor = ({
  readonly,
  editor,
  minHeight,
}: AdvancedTextEditorProps) => {
  const hasTextBubbleMenu = TEXT_BUBBLE_MENU_EXTENSION_NAMES.some(
    (extensionName) => hasEditorExtension(editor, extensionName),
  );

  return (
    <StyledEditorContainer readonly={readonly} minHeight={minHeight}>
      <EditorContent className="editor-content" editor={editor} />
      {hasEditorExtension(editor, 'image') &&
        !hasEditorExtension(editor, 'section') && (
          <ImageBubbleMenu editor={editor} />
        )}
      {hasTextBubbleMenu && <TextBubbleMenu editor={editor} />}
      {hasEditorExtension(editor, 'link') && <LinkBubbleMenu editor={editor} />}
    </StyledEditorContainer>
  );
};
