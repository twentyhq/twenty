import { FORM_FIELD_PLACEHOLDER_STYLES } from '@/object-record/record-field/ui/form-types/constants/FormFieldPlaceholderStyles';
import { styled } from '@linaria/react';
import { EditorContent, type Editor } from '@tiptap/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledEditor = styled.div<{
  multiline?: boolean;
  readonly?: boolean;
}>`
  width: 100%;
  display: flex;
  box-sizing: border-box;
  padding-right: ${({ multiline }) =>
    multiline ? themeCssVariables.spacing[4] : '0'};

  .editor-content {
    width: 100%;
  }

  .tiptap {
    padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
    box-sizing: border-box;
    display: flex;
    height: 100%;
    overflow-x: auto;
    overflow-y: ${({ multiline }) => (multiline ? 'auto' : 'hidden')};
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
    color: ${({ readonly }) =>
      readonly
        ? themeCssVariables.font.color.light
        : themeCssVariables.font.color.primary};
    font-family: ${themeCssVariables.font.family};
    font-weight: ${themeCssVariables.font.weight.regular};
    border: none !important;
    align-items: ${({ multiline }) => (multiline ? 'top' : 'center')};
    white-space: ${({ multiline }) => (multiline ? 'pre' : 'nowrap')};

    p.is-editor-empty:first-of-type::before {
      ${FORM_FIELD_PLACEHOLDER_STYLES}
      content: attr(data-placeholder);
      float: left;
      height: 0;
      pointer-events: none;
    }

    p {
      margin: 0;
    }

    .variable-tag {
      background-color: ${themeCssVariables.color.blue3};
      border-radius: ${themeCssVariables.border.radius.sm};
      color: ${themeCssVariables.color.blue};
      padding: ${themeCssVariables.spacing[1]};
    }

    .text-tag {
      background-color: ${themeCssVariables.color.blue3};
      border-radius: ${themeCssVariables.border.radius.sm};
      color: ${themeCssVariables.color.blue};
      padding: ${themeCssVariables.spacing[1]};
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
