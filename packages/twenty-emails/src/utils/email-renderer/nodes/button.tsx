import { Button, Column, Row } from 'react-email';
import { type JSONContent } from '@tiptap/core';
import { type ReactNode } from 'react';
import { blockStyle } from 'src/utils/email-renderer/utils/block-style';
import { safeUrl } from 'src/utils/email-renderer/utils/safe-url';

export const button = (node: JSONContent): ReactNode => {
  const label = (node.content ?? [])
    .map((childNode) => childNode.text ?? '')
    .join('');
  const href = node.attrs?.href;
  const align = node.attrs?.align ?? 'left';

  return (
    <Row>
      <Column align={align}>
        <Button href={safeUrl(href)} style={blockStyle(node.attrs?.style)}>
          {label}
        </Button>
      </Column>
    </Row>
  );
};
