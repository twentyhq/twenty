import type { PartialBlock } from '@blocknote/core';
import { isDefined } from 'twenty-shared/utils';

export const getFirstNonEmptyLineOfRichText = (
  blocks: PartialBlock[] | null,
): string => {
  if (blocks === null) {
    return '';
  }
  for (const block of blocks) {
    if (isDefined(block.content)) {
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
        if ('link' in content) {
          return content.link;
        }
        if ('text' in content) {
          const value = content.text.trim();
          if (value !== '') {
            return value;
          }
        }
      }
    }
  }

  return '';
};
