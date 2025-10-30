import { Text } from '@react-email/components';
import { type JSONContent } from '@tiptap/core';
import { type ReactNode } from 'react';
import { mappedNodeContent } from 'src/utils/email-renderer/renderers/render-node';

export const paragraph = (node: JSONContent): ReactNode => {
  const content = mappedNodeContent(node);

  return (
    <Text style={{ lineHeight: '1.5', margin: '0', padding: '0' }}>
      {content.length === 0 ? <>&nbsp;</> : content}
    </Text>
  );
};
