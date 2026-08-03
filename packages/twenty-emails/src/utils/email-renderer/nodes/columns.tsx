import { Column, Row } from 'react-email';
import { type JSONContent } from '@tiptap/core';
import { Fragment, type ReactNode } from 'react';
import { mappedNodeContent } from 'src/utils/email-renderer/renderers/render-node';
import { blockStyle } from 'src/utils/email-renderer/utils/block-style';

// Renders columns and its column children in one pass, since
// react-email <Column> must be a direct child of <Row>.
export const columns = (node: JSONContent): ReactNode => {
  const columns = node.content ?? [];
  const columnWidth = `${100 / Math.max(columns.length, 1)}%`;

  return (
    <Row style={blockStyle(node.attrs?.style)}>
      {columns.map((column, index) => (
        <Fragment key={index}>
          <Column
            style={{
              width: columnWidth,
              verticalAlign: 'top',
              ...blockStyle(column.attrs?.style),
            }}
          >
            {mappedNodeContent(column)}
          </Column>
        </Fragment>
      ))}
    </Row>
  );
};
