import { type JSONContent } from '@tiptap/core';
import { type ReactNode } from 'react';
import { mappedNodeContent } from 'src/utils/email-renderer/renderers/render-node';

export const listItem = (node: JSONContent): ReactNode => {
  return (
    <li
      style={{
        marginBottom: '8px',
        lineHeight: '1.5',
      }}
    >
      {mappedNodeContent(node)}
    </li>
  );
};
