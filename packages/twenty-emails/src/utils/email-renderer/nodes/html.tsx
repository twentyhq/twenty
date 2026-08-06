import { type JSONContent } from '@tiptap/core';
import { type ReactNode } from 'react';

// The raw HTML block is passed through unescaped on purpose: authors use it for
// table markup and client hacks that no node type covers. Nothing sanitizes it
// here, so the rendered markup is only safe because every send path funnels
// through compileOutboundEmailContent, which runs the whole document through
// DOMPurify. A caller rendering this package's output without that step would
// ship author-controlled markup straight to recipients.
export const html = (node: JSONContent): ReactNode => {
  const html = node.attrs?.html;

  if (typeof html !== 'string' || html === '') {
    return null;
  }

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};
