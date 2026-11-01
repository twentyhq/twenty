import { Column, Row } from 'react-email';
import { type JSONContent } from '@tiptap/core';
import { Fragment, type ReactNode } from 'react';
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

export const columns = (
  node: JSONContent,
  inherited: InheritedTypography,
  context: EmailNodeRenderContext,
): ReactNode => {
  const columnNodes = node.content ?? [];
  const columnWidth = `${100 / Math.max(columnNodes.length, 1)}%`;
  const rowStyle = blockStyle(node.attrs?.style);
  const rowTypography = mergeInheritedTypography(inherited, rowStyle);

  return (
    <Row style={{ ...blockSpacing(context), ...rowStyle }}>
      {columnNodes.map((column, index) => {
        const columnStyle = blockStyle(column.attrs?.style);

        return (
          <Fragment key={index}>
            <Column
              style={{
                width: columnWidth,
                verticalAlign: 'top',
                ...columnStyle,
              }}
            >
              {mappedNodeContent(
                column,
                mergeInheritedTypography(rowTypography, columnStyle),
              )}
            </Column>
          </Fragment>
        );
      })}
    </Row>
  );
};
