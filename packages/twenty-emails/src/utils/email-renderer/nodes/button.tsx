import { Button } from 'react-email';
import { type JSONContent } from '@tiptap/core';
import { type ReactNode } from 'react';
import { blockStyle } from 'src/utils/email-renderer/utils/block-style';

export const button = (node: JSONContent): ReactNode => {
  const label = (node.content ?? [])
    .map((childNode) => childNode.text ?? '')
    .join('');
  const href = node.attrs?.href;

  return (
    <Button
      href={typeof href === 'string' && href !== '' ? href : undefined}
      style={blockStyle(node.attrs?.style)}
    >
      {label}
    </Button>
  );
};
