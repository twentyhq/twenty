import { type JSONContent } from '@tiptap/core';
import { Fragment, type ReactNode } from 'react';
import { EMAIL_TYPOGRAPHY, TIPTAP_NODE_TYPES } from 'twenty-shared/utils';
import { mappedNodeContent } from 'src/utils/email-renderer/renderers/render-node';
import {
  blockSpacing,
  type EmailNodeRenderContext,
} from 'src/utils/email-renderer/utils/block-spacing';
import { blockStyle } from 'src/utils/email-renderer/utils/block-style';
import { type InheritedTypography } from 'src/utils/email-renderer/utils/inherited-typography';

export const listItem = (
  node: JSONContent,
  inherited: InheritedTypography,
  context: EmailNodeRenderContext,
): ReactNode => {
  const { color: textColor, ...typography } = inherited;

  return (
    <li
      style={{
        fontSize: EMAIL_TYPOGRAPHY.fontSize,
        lineHeight: EMAIL_TYPOGRAPHY.lineHeight,
        ...blockSpacing(context, EMAIL_TYPOGRAPHY.listItemSpacing),
        ...typography,
        color: EMAIL_TYPOGRAPHY.accentColor,
      }}
    >
      {(node.content ?? []).map((childNode, index) =>
        childNode.type === TIPTAP_NODE_TYPES.PARAGRAPH ? (
          <span
            key={index}
            style={{ color: textColor, ...blockStyle(childNode.attrs?.style) }}
          >
            {index > 0 && <br />}
            {mappedNodeContent(childNode, inherited)}
          </span>
        ) : (
          <Fragment key={index}>
            {mappedNodeContent({ content: [childNode] }, inherited)}
          </Fragment>
        ),
      )}
    </li>
  );
};
