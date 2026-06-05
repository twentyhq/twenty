import { isArray, isNonEmptyArray } from '@sniptt/guards';

import { toText } from 'src/logic-functions/utils/to-text';
import { isDefined } from 'src/utils/is-defined';

export const toStringArray = (value: unknown): string[] | undefined => {
  if (!isArray(value)) {
    return undefined;
  }

  const items: string[] = [];
  const seen = new Set<string>();

  for (const entry of value) {
    const text = toText(entry);
    if (isDefined(text) && !seen.has(text)) {
      seen.add(text);
      items.push(text);
    }
  }

  return isNonEmptyArray(items) ? items : undefined;
};
