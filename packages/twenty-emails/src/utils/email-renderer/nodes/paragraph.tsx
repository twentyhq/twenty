import { Text } from '@react-email/components';
import { type JSONContent } from '@tiptap/core';
import { type ReactNode } from 'react';
import { mappedNodeContent } from 'src/utils/email-renderer/nodes/render-node';

export const paragraph = (node: JSONContent): ReactNode => {
  return <Text>{mappedNodeContent(node)}</Text>;
};
