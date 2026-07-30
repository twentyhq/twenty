import { Column, Link, Row } from 'react-email';
import { type JSONContent } from '@tiptap/core';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const image = (node: JSONContent): ReactNode => {
  const { src, alt, align = 'left', width, href } = node?.attrs || {};
  if (!isDefined(src)) {
    return null;
  }

  const imageElement = (
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
  );

  return (
    <Row>
      <Column align={align}>
        {typeof href === 'string' && href !== '' ? (
          <Link href={href} target="_blank">
            {imageElement}
          </Link>
        ) : (
          imageElement
        )}
      </Column>
    </Row>
  );
};
