import type { PartialBlock } from '@blocknote/core';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const getFirstNonEmptyLineOfRichText = (
  blocks: PartialBlock[] | null,
): string => {
  if (blocks === null) return '';

  const isRecord = (v: unknown): v is Record<string, unknown> =>
    typeof v === 'object' && v !== null;

  for (const block of blocks) {
    if (isUndefinedOrNull(block.content)) continue;

    const contentArray = block.content as unknown[];

    if (contentArray.length === 0) continue;

    for (const content of contentArray) {
      if (isRecord(content) && 'link' in content && typeof (content as any).link === 'string') {
        return (content as any).link;
      }
      if (isRecord(content) && 'text' in content && typeof (content as any).text === 'string') {
        const value = (content as any).text.trim();
        if (value !== '') return value;
      }
      if (typeof content === 'string') {
        const value = content.trim();
        if (value !== '') return value;
      }
    }
  }

  return '';
};
