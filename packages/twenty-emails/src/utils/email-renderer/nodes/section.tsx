import { Section } from 'react-email';
import { type JSONContent } from '@tiptap/core';
import { type ReactNode } from 'react';
import { mappedNodeContent } from 'src/utils/email-renderer/renderers/render-node';
import { inlineCssToJs } from 'src/utils/email-renderer/utils/inline-css-to-js';

export const section = (node: JSONContent): ReactNode => {
  return (
    <Section style={inlineCssToJs(node.attrs?.style)}>
      {mappedNodeContent(node)}
    </Section>
  );
};
