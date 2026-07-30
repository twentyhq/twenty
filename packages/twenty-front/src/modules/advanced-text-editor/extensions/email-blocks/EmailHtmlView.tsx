import { styled } from '@linaria/react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledPreview = styled.div`
  border-radius: ${themeCssVariables.border.radius.sm};
  outline: 1px dashed transparent;
  outline-offset: 2px;

  &:hover {
    outline-color: ${themeCssVariables.border.color.medium};
  }
`;

// Email clients never execute scripts, so the preview should not either.
const neutralizeScripts = (html: string): string =>
  html
    .replace(/<script/gi, '&lt;script')
    .replace(/\son[a-z]+\s*=/gi, ' data-blocked-handler=');

export const EmailHtmlView = ({ node }: NodeViewProps) => {
  const html = typeof node.attrs.html === 'string' ? node.attrs.html : '';

  return (
    <NodeViewWrapper>
      <StyledPreview
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: neutralizeScripts(html) }}
      />
    </NodeViewWrapper>
  );
};
