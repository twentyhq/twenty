import { styled } from '@linaria/react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { HtmlNodeInlineEditor } from '@/advanced-text-editor/extensions/blocks/HtmlNodeInlineEditor';
import { sanitizeHtmlPreview } from '@/advanced-text-editor/utils/sanitizeHtmlPreview';

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
  const html = typeof node.attrs.html === 'string' ? node.attrs.html : '';

  if (extension.options.isInlineEditable === true && editor.isEditable) {
    return (
      <NodeViewWrapper>
        <HtmlNodeInlineEditor
          html={html}
          onChange={(value) => updateAttributes({ html: value })}
          onFocus={(htmlEditor) => {
            if (isDefined(editor.storage.html)) {
              editor.storage.html.focusedHtmlEditor = htmlEditor;
            }
          }}
        />
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
