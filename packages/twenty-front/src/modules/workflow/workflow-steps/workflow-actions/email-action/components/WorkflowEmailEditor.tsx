import { FORM_FIELD_PLACEHOLDER_STYLES } from '@/object-record/record-field/ui/form-types/constants/FormFieldPlaceholderStyles';
import { ImageBubbleMenu } from '@/workflow/workflow-steps/workflow-actions/email-action/components/image-bubble-menu/ImageBubbleMenu';
import { LinkBubbleMenu } from '@/workflow/workflow-steps/workflow-actions/email-action/components/link-bubble-menu/LinkBubbleMenu';
import { TextBubbleMenu } from '@/workflow/workflow-steps/workflow-actions/email-action/components/text-bubble-menu/TextBubbleMenu';
import styled from '@emotion/styled';
import { EditorContent, type Editor } from '@tiptap/react';

const EMAIL_EDITOR_MIN_HEIGHT = 340;
const EMAIL_EDITOR_MAX_WIDTH = 600;

const StyledEditorContainer = styled.div<{
  readonly?: boolean;
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
    min-height: ${EMAIL_EDITOR_MIN_HEIGHT}px;
    max-width: ${EMAIL_EDITOR_MAX_WIDTH}px;
    margin: 0 auto;
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
      background-color: ${({ theme }) => theme.color.blue10};
      border-radius: ${({ theme }) => theme.border.radius.sm};
      color: ${({ theme }) => theme.color.blue};
      padding: ${({ theme }) => theme.spacing(1)};
    }

    h1 {
      font-size: 36px;
    }

    h2 {
      font-size: 30px;
    }

    h3 {
      font-size: 24px;
    }
  }

  .ProseMirror-focused {
    outline: none;
  }

  .ProseMirror-hideselection * {
    caret-color: transparent;
  }
`;

type WorkflowEmailEditorProps = {
  readonly: boolean | undefined;
  editor: Editor;
};

export const WorkflowEmailEditor = ({
  readonly,
  editor,
}: WorkflowEmailEditorProps) => {
  return (
    <StyledEditorContainer readonly={readonly}>
      <EditorContent className="editor-content" editor={editor} />
      <ImageBubbleMenu editor={editor} />
      <TextBubbleMenu editor={editor} />
      <LinkBubbleMenu editor={editor} />
    </StyledEditorContainer>
  );
};
