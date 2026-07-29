import { Button } from 'react-email';
import { type JSONContent } from '@tiptap/core';
import { type ReactNode } from 'react';
import { inlineCssToJs } from 'src/utils/email-renderer/utils/inline-css-to-js';

export const emailButton = (node: JSONContent): ReactNode => {
  const label = (node.content ?? [])
    .map((childNode) => childNode.text ?? '')
    .join('');
  const href = node.attrs?.href;

  return (
    <Button
      href={typeof href === 'string' && href !== '' ? href : undefined}
      style={inlineCssToJs(node.attrs?.style)}
    >
      {label}
    </Button>
  );
};
