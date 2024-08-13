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
      const contentArray = node.content as Array<
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
