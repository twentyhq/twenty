import { isNonEmptyString } from '@sniptt/guards';

export const normalizeSlackParentMessageTimestamp = (
  parentMessageTimestamp: unknown,
): string | undefined => {
  if (!isNonEmptyString(parentMessageTimestamp)) {
    return undefined;
  }

  const trimmedParentMessageTimestamp = parentMessageTimestamp.trim();

  return isNonEmptyString(trimmedParentMessageTimestamp)
    ? trimmedParentMessageTimestamp
    : undefined;
};
