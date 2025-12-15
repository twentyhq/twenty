import { type JSONContent } from '@tiptap/core';
import { type ReactNode } from 'react';

export const hardBreak = (_node: JSONContent): ReactNode => {
  return <br />;
};
