import type { PartialBlock } from '@blocknote/core';

export const getFirstNonEmptyLineOfRichText = (
  blocks: PartialBlock[] | null,
): string => {
  if (blocks === null) {
    return '';
  }

  for (const block of blocks) {
    if (!Array.isArray(block.content) || block.content.length === 0) {
      continue;
    }

    for (const content of block.content) {
      if (typeof content !== 'object' || content === null) {
        continue;
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
