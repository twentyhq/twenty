import type { PartialBlock } from '@blocknote/core';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const getFirstNonEmptyLineOfRichText = (
  blocks: PartialBlock[] | null,
): string => {
  if (blocks === null) {
    return '';
  }
  for (const block of blocks) {
    if (!isUndefinedOrNull(block.content)) {
      const contentArray = block.content as Array<
        { text: string } | { link: string }
      >;
      if (contentArray.length > 0) {
        for (const content of contentArray) {
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
  }

  return '';
};
