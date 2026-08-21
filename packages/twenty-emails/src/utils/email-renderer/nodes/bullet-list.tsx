import { type JSONContent } from '@tiptap/core';
import { type ReactNode } from 'react';
import { mappedNodeContent } from 'src/utils/email-renderer/renderers/render-node';
import { type InheritedTypography } from 'src/utils/email-renderer/utils/inherited-typography';

export const bulletList = (
  node: JSONContent,
  inherited: InheritedTypography = {},
): ReactNode => {
  return (
    <ul
      style={{
        marginBottom: '16px',
        lineHeight: '1.5',
        ...inherited,
      }}
    >
      {mappedNodeContent(node, inherited)}
    </ul>
  );
};
