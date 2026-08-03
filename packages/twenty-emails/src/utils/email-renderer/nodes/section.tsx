import { Section } from 'react-email';
import { type JSONContent } from '@tiptap/core';
import { type ReactNode } from 'react';
import { mappedNodeContent } from 'src/utils/email-renderer/renderers/render-node';
import { blockStyle } from 'src/utils/email-renderer/utils/block-style';

export const section = (node: JSONContent): ReactNode => {
  return (
    <Section style={blockStyle(node.attrs?.style)}>
      {mappedNodeContent(node)}
    </Section>
  );
};
