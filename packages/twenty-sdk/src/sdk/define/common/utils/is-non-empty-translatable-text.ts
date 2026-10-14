import { isNonEmptyString, isString } from '@sniptt/guards';

import { type TranslatableText } from '@/sdk/define/common/types/translatable-text.type';

export const isNonEmptyTranslatableText = (
  text: TranslatableText | null | undefined,
): boolean =>
  isString(text) ? isNonEmptyString(text) : isNonEmptyString(text?.message);
