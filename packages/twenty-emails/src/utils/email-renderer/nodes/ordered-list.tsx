import { type JSONContent } from '@tiptap/core';
import { type ReactNode } from 'react';
import { EMAIL_TYPOGRAPHY } from 'twenty-shared/utils';
import { mappedNodeContent } from 'src/utils/email-renderer/renderers/render-node';
import {
  blockSpacing,
  type EmailNodeRenderContext,
} from 'src/utils/email-renderer/utils/block-spacing';
import { type InheritedTypography } from 'src/utils/email-renderer/utils/inherited-typography';

export const orderedList = (
  node: JSONContent,
  inherited: InheritedTypography,
  context: EmailNodeRenderContext,
): ReactNode => {
  return (
    <ol
      style={{
        paddingLeft: EMAIL_TYPOGRAPHY.listIndent,
        ...blockSpacing(context),
        ...inherited,
      }}
    >
      {mappedNodeContent(node, inherited)}
    </ol>
  );
};
