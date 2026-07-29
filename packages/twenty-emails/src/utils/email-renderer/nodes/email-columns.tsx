import { Column, Row } from 'react-email';
import { type JSONContent } from '@tiptap/core';
import { Fragment, type ReactNode } from 'react';
import { mappedNodeContent } from 'src/utils/email-renderer/renderers/render-node';
import { inlineCssToJs } from 'src/utils/email-renderer/utils/inline-css-to-js';

// Renders emailColumns and its emailColumn children in one pass, since
// react-email <Column> must be a direct child of <Row>.
export const emailColumns = (node: JSONContent): ReactNode => {
  const columns = node.content ?? [];
  const columnWidth = `${100 / Math.max(columns.length, 1)}%`;

  return (
    <Row style={inlineCssToJs(node.attrs?.style)}>
      {columns.map((column, index) => (
        <Fragment key={index}>
          <Column
            style={{
              width: columnWidth,
              verticalAlign: 'top',
              ...inlineCssToJs(column.attrs?.style),
            }}
          >
            {mappedNodeContent(column)}
          </Column>
        </Fragment>
      ))}
    </Row>
  );
};
