import { type JSONContent } from '@tiptap/core';
import { type ReactNode } from 'react';
import { mappedNodeContent } from 'src/utils/email-renderer/renderers/render-node';

export const orderedList = (node: JSONContent): ReactNode => {
  return (
    <ol
      style={{
        marginBottom: '16px',
        lineHeight: '1.5',
      }}
    >
      {mappedNodeContent(node)}
    </ol>
  );
};
