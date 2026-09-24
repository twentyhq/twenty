import { styled } from '@linaria/react';
import { EditorContent, type Editor } from '@tiptap/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useTextVariableEditor } from '@/object-record/record-field/ui/form-types/hooks/useTextVariableEditor';
import { FORM_FIELD_PLACEHOLDER_STYLES } from '@/ui/input/constants/FormFieldPlaceholderStyles';

type HtmlNodeInlineEditorProps = {
  html: string;
  onChange: (html: string) => void;
  onFocus: (htmlEditor: Editor) => void;
};

const StyledHtmlEditor = styled.div`
  .tiptap {
    color: ${themeCssVariables.font.color.primary};
    font-family: ${themeCssVariables.code.font.family};
    font-size: ${themeCssVariables.font.size.sm};
    outline: none;
    overflow-wrap: anywhere;
    white-space: pre-wrap;

    p {
      margin: 0;
    }

    p.is-editor-empty:first-of-type::before {
      ${FORM_FIELD_PLACEHOLDER_STYLES}
      content: attr(data-placeholder);
      float: left;
      height: 0;
      pointer-events: none;
    }
  }
`;

export const HtmlNodeInlineEditor = ({
  html,
  onChange,
  onFocus,
}: HtmlNodeInlineEditorProps) => {
  const htmlEditor = useTextVariableEditor({
    placeholder: '<p>Paste or write your HTML here</p>',
    multiline: true,
    readonly: false,
    defaultValue: html,
    onUpdate: (editor) => onChange(editor.getText()),
  });

  if (!isDefined(htmlEditor)) {
    return null;
  }

  return (
    <StyledHtmlEditor onFocus={() => onFocus(htmlEditor)}>
      <EditorContent editor={htmlEditor} />
    </StyledHtmlEditor>
  );
};
