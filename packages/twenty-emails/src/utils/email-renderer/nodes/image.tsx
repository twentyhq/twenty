import { Column, Row } from '@react-email/components';
import { type JSONContent } from '@tiptap/core';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const image = (node: JSONContent): ReactNode => {
  const { src, alt, align = 'left', width } = node?.attrs || {};
  if (!isDefined(src)) {
    return null;
  }

  return (
    <Row>
      <Column align={align}>
        <img
          src={src}
          alt={alt}
          style={{
            width: isDefined(width) ? width : 'auto',
            height: 'auto',
            maxWidth: '100%',
            outline: 'none',
            border: 'none',
            textDecoration: 'none',
            display: 'block',
          }}
        />
      </Column>
    </Row>
  );
};
