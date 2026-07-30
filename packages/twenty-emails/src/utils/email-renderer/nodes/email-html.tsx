import { type JSONContent } from '@tiptap/core';
import { type ReactNode } from 'react';

// The block's whole point is embedding author-provided markup verbatim, so it
// is intentionally not sanitized here; email clients do not execute scripts.
export const emailHtml = (node: JSONContent): ReactNode => {
  const html = node.attrs?.html;

  if (typeof html !== 'string' || html === '') {
    return null;
  }

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};
