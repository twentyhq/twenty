import { Text } from 'react-email';
import { type JSONContent } from '@tiptap/core';
import { type ReactNode } from 'react';
import { mappedNodeContent } from 'src/utils/email-renderer/renderers/render-node';
import { type InheritedTypography } from 'src/utils/email-renderer/utils/inherited-typography';

export const paragraph = (
  node: JSONContent,
  inherited: InheritedTypography = {},
): ReactNode => {
  const content = mappedNodeContent(node, inherited);

  return (
    <Text
      style={{ lineHeight: '1.5', margin: '0', padding: '0', ...inherited }}
    >
      {content.length === 0 ? <>&nbsp;</> : content}
    </Text>
  );
};
