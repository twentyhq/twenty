import { type JSONContent } from '@tiptap/core';
import { type ReactNode } from 'react';
import { EMAIL_TYPOGRAPHY } from 'twenty-shared/utils';
import { mappedNodeContent } from 'src/utils/email-renderer/renderers/render-node';
import {
  blockSpacing,
  type EmailNodeRenderContext,
} from 'src/utils/email-renderer/utils/block-spacing';
import { blockStyle } from 'src/utils/email-renderer/utils/block-style';
import {
  type InheritedTypography,
  mergeInheritedTypography,
} from 'src/utils/email-renderer/utils/inherited-typography';

export const blockquote = (
  node: JSONContent,
  inherited: InheritedTypography,
  context: EmailNodeRenderContext,
): ReactNode => {
  const style = blockStyle(node.attrs?.style);

  return (
    <blockquote
      style={{
        borderLeft: `${EMAIL_TYPOGRAPHY.quoteBorderWidth} solid ${EMAIL_TYPOGRAPHY.accentColor}`,
        fontStyle: 'italic',
        marginLeft: '0',
        marginRight: '0',
        ...blockSpacing(context),
        paddingLeft: EMAIL_TYPOGRAPHY.quoteIndent,
        ...style,
      }}
    >
      {mappedNodeContent(node, mergeInheritedTypography(inherited, style))}
    </blockquote>
  );
};
