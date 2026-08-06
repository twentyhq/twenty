import { styled } from '@linaria/react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { sanitizeHtmlPreview } from '@/advanced-text-editor/utils/sanitizeHtmlPreview';

type HtmlNodeViewProps = Pick<NodeViewProps, 'node'>;

const StyledPreview = styled.div`
  border-radius: ${themeCssVariables.border.radius.sm};
  outline: 1px dashed transparent;
  outline-offset: 2px;

  // Inline styles survive sanitization so the preview matches the sent email,
  // which leaves the block free to position content over the editor chrome.
  // Paint containment keeps that rendering inside the block's own box.
  contain: paint;

  &:hover {
    outline-color: ${themeCssVariables.border.color.medium};
  }
`;

export const HtmlNodeView = ({ node }: HtmlNodeViewProps) => {
  const html = typeof node.attrs.html === 'string' ? node.attrs.html : '';

  return (
    <NodeViewWrapper>
      <StyledPreview
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: sanitizeHtmlPreview(html) }}
      />
    </NodeViewWrapper>
  );
};
