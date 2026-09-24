import { styled } from '@linaria/react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { useId } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { sanitizeHtmlPreview } from '@/advanced-text-editor/utils/sanitizeHtmlPreview';
import { TextArea } from '@/ui/input/components/TextArea';

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

export const HtmlNodeView = ({
  node,
  editor,
  extension,
  updateAttributes,
}: HtmlNodeViewProps) => {
  const textAreaId = useId();
  const html = typeof node.attrs.html === 'string' ? node.attrs.html : '';

  const isEditingInline =
    extension.options.isInlineEditable === true && editor.isEditable;

  return (
    <NodeViewWrapper>
      {isEditingInline ? (
        <TextArea
          textAreaId={textAreaId}
          value={html}
          onChange={(value) => updateAttributes({ html: value })}
          placeholder="<p>Hello</p>"
          minRows={6}
          maxRows={16}
        />
      ) : (
        <StyledPreview
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: sanitizeHtmlPreview(html) }}
        />
      )}
    </NodeViewWrapper>
  );
};
