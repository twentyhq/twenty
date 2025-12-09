import type { PartialBlock } from '@blocknote/core';
import { isArray, isNonEmptyString } from '@sniptt/guards';

export const parseInitialBlocknote = (
  blocknote?: string | null,
  logContext?: string,
): PartialBlock[] | undefined => {
  if (isNonEmptyString(blocknote) && blocknote !== '{}') {
    let parsedBody: PartialBlock[] | undefined = undefined;

    try {
      parsedBody = JSON.parse(blocknote);
    } catch {
      // eslint-disable-next-line no-console
      console.warn(logContext ?? `Failed to parse blocknote body`);
    }

    if (isArray(parsedBody) && parsedBody.length === 0) {
      return undefined;
    }

    return parsedBody;
  }

  return undefined;
};
