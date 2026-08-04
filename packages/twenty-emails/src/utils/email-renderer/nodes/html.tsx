import { type JSONContent } from '@tiptap/core';
import { type ReactNode } from 'react';

export const html = (node: JSONContent): ReactNode => {
  const html = node.attrs?.html;

  if (typeof html !== 'string' || html === '') {
    return null;
  }

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};
