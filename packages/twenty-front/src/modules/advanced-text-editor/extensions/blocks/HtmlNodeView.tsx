import { styled } from '@linaria/react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { sanitizeHtmlPreview } from '@/advanced-text-editor/utils/sanitizeHtmlPreview';
import { FormRawJsonFieldInput } from '@/object-record/record-field/ui/form-types/components/FormRawJsonFieldInput';
import { type VariablePickerComponent } from '@/ui/input/types/VariablePickerComponent';

type HtmlNodeViewProps = Pick<
  NodeViewProps,
  'node' | 'editor' | 'extension' | 'updateAttributes'
>;

const StyledPreview = styled.div`
  border-radius: ${themeCssVariables.border.radius.sm};
  outline: 1px dashed transparent;
  outline-offset: 2px;

  &:hover {
    outline-color: ${themeCssVariables.border.color.medium};
  }
`;

const StyledInlineEditorContainer = styled.div`
  padding-top: ${themeCssVariables.spacing[6]};
`;

export const HtmlNodeView = ({
  node,
  editor,
  extension,
  updateAttributes,
}: HtmlNodeViewProps) => {
  const html = typeof node.attrs.html === 'string' ? node.attrs.html : '';
  const VariablePicker: VariablePickerComponent | undefined =
    extension.options.VariablePicker;

  if (isDefined(VariablePicker) && editor.isEditable) {
    return (
      <NodeViewWrapper>
        <StyledInlineEditorContainer>
          <FormRawJsonFieldInput
            defaultValue={html}
            placeholder="<p>Hello</p>"
            onChange={(value) => updateAttributes({ html: value ?? '' })}
            VariablePicker={VariablePicker}
          />
        </StyledInlineEditorContainer>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper>
      <StyledPreview
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: sanitizeHtmlPreview(html) }}
      />
    </NodeViewWrapper>
  );
};
