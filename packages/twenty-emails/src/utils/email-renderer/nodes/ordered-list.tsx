import { type JSONContent } from '@tiptap/core';
import { type ReactNode } from 'react';
import { mappedNodeContent } from 'src/utils/email-renderer/renderers/render-node';
import { type InheritedTypography } from 'src/utils/email-renderer/utils/inherited-typography';

export const orderedList = (
  node: JSONContent,
  inherited: InheritedTypography = {},
): ReactNode => {
  return (
    <ol
      style={{
        marginBottom: '16px',
        lineHeight: '1.5',
        ...inherited,
      }}
    >
      {mappedNodeContent(node, inherited)}
    </ol>
  );
};
