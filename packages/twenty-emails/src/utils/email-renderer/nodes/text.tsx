import { type JSONContent } from '@tiptap/core';
import { type ReactNode } from 'react';
import { renderMark } from 'src/utils/email-renderer/renderers/render-mark';
import { isDefined } from 'twenty-shared/utils';

export const text = (node: JSONContent): ReactNode => {
  if (isDefined(node?.marks)) {
    return renderMark(node);
  }

  const { text } = node;
  if (!isDefined(text)) {
    return <>&nbsp;</>;
  }

  return <>{text}</>;
};
