import { Column, Link, Row } from 'react-email';
import { type JSONContent } from '@tiptap/core';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

import {
  blockSpacing,
  type EmailNodeRenderContext,
} from 'src/utils/email-renderer/utils/block-spacing';
import { type InheritedTypography } from 'src/utils/email-renderer/utils/inherited-typography';
import { safeUrl } from 'src/utils/email-renderer/utils/safe-url';

export const image = (
  node: JSONContent,
  _inherited: InheritedTypography,
  context: EmailNodeRenderContext,
): ReactNode => {
  const { src: rawSrc, alt, align = 'left', width, href } = node?.attrs || {};
  const src = safeUrl(rawSrc);
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
    <Row style={blockSpacing(context)}>
      <Column align={align}>
        {isDefined(safeUrl(href)) ? (
          <Link href={safeUrl(href)} target="_blank">
            {imageElement}
          </Link>
        ) : (
          imageElement
        )}
      </Column>
    </Row>
  );
};
