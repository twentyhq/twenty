import { Hr } from 'react-email';
import { type JSONContent } from '@tiptap/core';
import { type ReactNode } from 'react';
import { blockStyle } from 'src/utils/email-renderer/utils/block-style';

export const divider = (node: JSONContent): ReactNode => {
  return <Hr style={blockStyle(node.attrs?.style)} />;
};
