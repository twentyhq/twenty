import { Text } from 'react-email';
import { type JSONContent } from '@tiptap/core';
import { type ReactNode } from 'react';
import { EMAIL_TYPOGRAPHY } from 'twenty-shared/utils';
import { mappedNodeContent } from 'src/utils/email-renderer/renderers/render-node';
import {
  blockSpacing,
  type EmailNodeRenderContext,
} from 'src/utils/email-renderer/utils/block-spacing';
import { blockStyle } from 'src/utils/email-renderer/utils/block-style';
import { type InheritedTypography } from 'src/utils/email-renderer/utils/inherited-typography';

export const paragraph = (
  node: JSONContent,
  inherited: InheritedTypography,
  context: EmailNodeRenderContext,
): ReactNode => {
  const content = mappedNodeContent(node, inherited);

  return (
    <Text
      style={{
        fontSize: EMAIL_TYPOGRAPHY.fontSize,
        lineHeight: EMAIL_TYPOGRAPHY.lineHeight,
        padding: '0',
        ...blockSpacing(context),
        ...inherited,
        ...blockStyle(node.attrs?.style),
      }}
    >
      {content.length === 0 ? <>&nbsp;</> : content}
    </Text>
  );
};
