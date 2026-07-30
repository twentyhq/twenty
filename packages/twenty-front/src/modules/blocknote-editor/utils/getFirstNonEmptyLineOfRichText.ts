import type { PartialBlock } from '@blocknote/core';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const getFirstNonEmptyLineOfRichText = (
  blocks: PartialBlock[] | null,
): string => {
  if (blocks === null) {
    return '';
  }
  for (const block of blocks) {
    if (isUndefinedOrNull(block) || isUndefinedOrNull(block.content)) {
      continue;
    }

    const contentArray = Array.isArray(block.content)
      ? (block.content as Array<{ text: string } | { link: string }>)
      : [block.content as { text: string } | { link: string } | string];

    for (const content of contentArray) {
      if (typeof content === 'string') {
        const value = content.trim();
        if (value !== '') {
          return value;
        }
        continue;
      }

      if (typeof content !== 'object' || content === null) {
        continue;
      }

      if ('link' in content && typeof content.link === 'string') {
        return content.link;
      }

      if ('text' in content && typeof content.text === 'string') {
        const value = content.text.trim();
        if (value !== '') {
          return value;
        }
      }
    }
  }

  return '';
};
