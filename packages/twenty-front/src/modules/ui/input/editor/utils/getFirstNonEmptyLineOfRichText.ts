import { PartialBlock } from '@blocknote/core';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const getFirstNonEmptyLineOfRichText = (
  fieldValue: PartialBlock[] | null,
): string => {
  if (fieldValue === null) {
    return '';
  }
  for (const node of fieldValue) {
    if (!isUndefinedOrNull(node.content)) {
      const contentArray = node.content as Array<{ text: string }>;
      if (contentArray.length > 0) {
        for (const content of contentArray) {
          if (content.text.trim() !== '') {
            return content.text;
          }
        }
      }
    }
  }
  return '';
};
