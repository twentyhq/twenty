import type { PartialBlock } from '@blocknote/core';
import { isArray, isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

const isObjectRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const sanitizePartialBlock = (block: unknown): PartialBlock | undefined => {
  if (!isObjectRecord(block) || !isNonEmptyString(block.type)) {
    return undefined;
  }

  const sanitizedBlock = {
    ...block,
  } as PartialBlock;

  if (isArray(block.children)) {
    sanitizedBlock.children = block.children
      .map(sanitizePartialBlock)
      .filter(isDefined);
  }

  return sanitizedBlock;
};

export const parseInitialBlocknote = (
  blocknote?: string | null,
  logContext?: string,
): PartialBlock[] | undefined => {
  if (isNonEmptyString(blocknote) && blocknote !== '{}') {
    let parsedBody: unknown = undefined;

    // TODO: Remove this once we have removed the old rich text
    try {
      parsedBody = JSON.parse(blocknote);
    } catch {
      // oxlint-disable-next-line no-console
      console.warn(logContext ?? `Failed to parse blocknote body`);
      // oxlint-disable-next-line no-console
      console.warn(blocknote);
    }

    if (!isArray(parsedBody)) {
      return undefined;
    }

    const sanitizedBody = parsedBody
      .map(sanitizePartialBlock)
      .filter(isDefined);

    if (sanitizedBody.length === 0) {
      return undefined;
    }

    return sanitizedBody;
  }

  return undefined;
};
