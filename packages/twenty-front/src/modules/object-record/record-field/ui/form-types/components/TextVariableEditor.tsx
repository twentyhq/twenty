import { FORM_FIELD_PLACEHOLDER_STYLES } from '@/ui/input/constants/FormFieldPlaceholderStyles';
import { styled } from '@linaria/react';
import { EditorContent, type Editor, useEditorState } from '@tiptap/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledEditor = styled.div<{
  multiline?: boolean;
  readonly?: boolean;
}>`
  box-sizing: border-box;
  display: grid;
  height: 100%;
  min-width: 0;
  padding-right: ${({ multiline }) =>
    multiline ? themeCssVariables.spacing[8] : '0'};
  width: 100%;
  .editor-content {
    grid-area: 1 / 1;
    min-width: 0;
    width: 100%;
  }

  // Measure the placeholder outside the editable paragraph to preserve caret positioning.
  &[data-placeholder]::after {
    ${FORM_FIELD_PLACEHOLDER_STYLES}
    content: attr(data-placeholder);
    grid-area: 1 / 1;
    min-width: 0;
    overflow-wrap: anywhere;
    padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
    pointer-events: none;
    visibility: hidden;
    white-space: normal;
  }

  .tiptap {
    align-items: ${({ multiline }) => (multiline ? 'flex-start' : 'center')};
    border: none !important;
    box-sizing: border-box;
    color: ${({ readonly }) =>
      readonly
        ? themeCssVariables.font.color.light
        : themeCssVariables.font.color.primary};
    display: ${({ multiline }) => (multiline ? 'block' : 'flex')};
    font-family: ${themeCssVariables.font.family};
    font-weight: ${themeCssVariables.font.weight.regular};
    &::-webkit-scrollbar {
      display: none;
    }
    height: ${({ multiline }) => (multiline ? 'auto' : '100%')};
    overflow-wrap: ${({ multiline }) => (multiline ? 'anywhere' : 'normal')};
    overflow-x: ${({ multiline }) => (multiline ? 'visible' : 'auto')};
    overflow-y: ${({ multiline }) => (multiline ? 'visible' : 'hidden')};
    padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
    scrollbar-width: none;
    white-space: ${({ multiline }) => (multiline ? 'pre-wrap' : 'nowrap')};

    p.is-editor-empty:first-of-type::before {
      ${FORM_FIELD_PLACEHOLDER_STYLES}
      content: attr(data-placeholder);
      float: left;
      height: 0;
      pointer-events: none;
      white-space: ${({ multiline }) => (multiline ? 'normal' : 'nowrap')};
    }

    p {
      margin: 0;
      min-width: ${({ multiline }) => (multiline ? '0' : 'auto')};
    }

    .variable-tag {
      background-color: ${themeCssVariables.color.blue3};
      border-radius: ${themeCssVariables.border.radius.md};
      color: ${themeCssVariables.color.blue};
      padding: ${themeCssVariables.spacing[1]};
    }

    .text-tag {
      background-color: ${themeCssVariables.color.blue3};
      border-radius: ${themeCssVariables.border.radius.md};
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
  placeholder?: string;
};

export const TextVariableEditor = ({
  multiline,
  readonly,
  editor,
  placeholder,
}: TextVariableEditorProps) => {
  const isEmpty = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => currentEditor.isEmpty,
  });

  return (
    <StyledEditor
      multiline={multiline}
      readonly={readonly}
      data-placeholder={multiline && isEmpty ? placeholder : undefined}
    >
      <EditorContent className="editor-content" editor={editor} />
    </StyledEditor>
  );
};
