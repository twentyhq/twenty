import { ImageBubbleMenu } from '@/advanced-text-editor/components/ImageBubbleMenu';
import { LinkBubbleMenu } from '@/advanced-text-editor/components/LinkBubbleMenu';
import { TextBubbleMenu } from '@/advanced-text-editor/components/TextBubbleMenu';
import { type AdvancedTextEditorChrome } from '@/advanced-text-editor/types/AdvancedTextEditorPreset';
import { hasEditorExtension } from '@/advanced-text-editor/utils/hasEditorExtension';
import { FORM_FIELD_PLACEHOLDER_STYLES } from '@/object-record/record-field/ui/form-types/constants/FormFieldPlaceholderStyles';
import { styled } from '@linaria/react';
import { EditorContent, type Editor, useEditorState } from '@tiptap/react';
import { isDefined, resolveEmailTheme } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

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

    /* Email block nodes: inline styles on the element carry the authored
       look; the rules below only add editing affordances. */
    .email-section {
      border-radius: ${themeCssVariables.border.radius.sm};
      box-sizing: border-box;
      margin-bottom: ${themeCssVariables.spacing[2]};
      outline: 1px dashed transparent;
      outline-offset: 2px;

      &:hover {
        outline-color: ${themeCssVariables.border.color.medium};
      }
    }

    .email-columns {
      box-sizing: border-box;
      display: flex;
      gap: ${themeCssVariables.spacing[2]};
      margin-bottom: ${themeCssVariables.spacing[2]};
    }

    .email-column {
      box-sizing: border-box;
      flex: 1;
      min-width: 0;
      outline: 1px dashed ${themeCssVariables.border.color.light};
      outline-offset: 2px;
      border-radius: ${themeCssVariables.border.radius.sm};
    }

    .email-button-wrapper {
      margin-bottom: ${themeCssVariables.spacing[2]};
    }

    .email-button {
      box-sizing: border-box;
      cursor: text;
      width: fit-content;
    }

    .email-divider {
      border-left: none;
      border-right: none;
      border-bottom: none;
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

const StyledEmailCanvasBackdrop = styled.div`
  box-sizing: border-box;
  flex-grow: 1;
  min-height: 100%;
  padding: ${themeCssVariables.spacing[8]} ${themeCssVariables.spacing[4]};
  width: 100%;
`;

const StyledEmailPage = styled.div`
  box-shadow:
    0px 2px 4px 0px ${themeCssVariables.background.transparent.light},
    0px 0px 4px 0px ${themeCssVariables.background.transparent.medium};
  box-sizing: border-box;
  margin: 0 auto;
  max-width: 100%;
  min-height: 400px;

  .editor-content {
    min-height: inherit;
  }

  .tiptap {
    min-height: inherit;
    padding: 0;
  }
`;

type AdvancedTextEditorProps = {
  readonly: boolean | undefined;
  editor: Editor;
  minHeight: number;
  chrome?: AdvancedTextEditorChrome;
};

// Marks and nodes the text bubble menu can act on. When a preset loads none
// of them, the menu has nothing to offer and does not mount at all.
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

export const AdvancedTextEditor = ({
  readonly,
  editor,
  minHeight,
  chrome,
}: AdvancedTextEditorProps) => {
  const hasTextBubbleMenu = TEXT_BUBBLE_MENU_EXTENSION_NAMES.some(
    (extensionName) => hasEditorExtension(editor, extensionName),
  );

  const emailTheme = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) =>
      resolveEmailTheme(currentEditor.state.doc.attrs.emailTheme),
  });

  const hasEmailCanvas = chrome === 'emailCanvas' && isDefined(emailTheme);

  return (
    <StyledEditorContainer readonly={readonly} minHeight={minHeight}>
      {hasEmailCanvas ? (
        <StyledEmailCanvasBackdrop
          style={{
            backgroundColor: emailTheme.pageBackground,
            padding: emailTheme.pagePadding,
          }}
        >
          <StyledEmailPage
            style={{
              backgroundColor: emailTheme.bodyBackground,
              border:
                emailTheme.borderWidth !== '' &&
                emailTheme.borderWidth !== '0px'
                  ? `${emailTheme.borderWidth} solid ${emailTheme.borderColor}`
                  : undefined,
              borderRadius: emailTheme.cornerRadius,
              color: emailTheme.textColor,
              marginLeft: emailTheme.bodyAlign === 'left' ? 0 : 'auto',
              marginRight: emailTheme.bodyAlign === 'right' ? 0 : 'auto',
              padding: emailTheme.padding,
              width: emailTheme.width,
            }}
          >
            <EditorContent className="editor-content" editor={editor} />
          </StyledEmailPage>
        </StyledEmailCanvasBackdrop>
      ) : (
        <EditorContent className="editor-content" editor={editor} />
      )}
      {hasEditorExtension(editor, 'image') && (
        <ImageBubbleMenu editor={editor} />
      )}
      {hasTextBubbleMenu && <TextBubbleMenu editor={editor} />}
      {hasEditorExtension(editor, 'link') && <LinkBubbleMenu editor={editor} />}
    </StyledEditorContainer>
  );
};
