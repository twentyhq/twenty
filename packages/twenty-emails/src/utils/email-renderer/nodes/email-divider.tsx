import { Hr } from 'react-email';
import { type JSONContent } from '@tiptap/core';
import { type ReactNode } from 'react';
import { inlineCssToJs } from 'src/utils/email-renderer/utils/inline-css-to-js';

export const emailDivider = (node: JSONContent): ReactNode => {
  return <Hr style={inlineCssToJs(node.attrs?.style)} />;
};
