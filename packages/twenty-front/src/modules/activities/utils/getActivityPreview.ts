import type { PartialBlock } from '@blocknote/core';
import { isArray, isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { parseInitialBlocknote } from '@/blocknote-editor/utils/parseInitialBlocknote';

const extractTextFromBlock = (block: PartialBlock): string => {
  if (!isDefined(block.content) || !isArray(block.content)) return '';

  return (
    block.content as Array<{
      type: string;
      text?: string;
      content?: Array<{ type: string; text?: string }>;
    }>
  )
    .map((inline) => {
      if (inline.type === 'text') {
        return inline.text ?? '';
      }
      if (inline.type === 'link' && isArray(inline.content)) {
        return inline.content
          .map((child) => (child.type === 'text' ? (child.text ?? '') : ''))
          .join(' ');
      }
      return '';
    })
    .join('');
};

export const getActivityPreview = (activityBody: string | null): string => {
  const blocks = parseInitialBlocknote(activityBody) ?? [];

  return blocks.map(extractTextFromBlock).filter(isNonEmptyString).join('\n');
};
