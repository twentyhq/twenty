import { isPlainObject } from 'twenty-shared/utils';

export const getUserFriendlySyncErrorMessage = (
  error: unknown,
): string | undefined => {
  if (!isPlainObject(error)) {
    return undefined;
  }

  const { userFriendlyMessage } = error as { userFriendlyMessage?: unknown };

  return typeof userFriendlyMessage === 'string'
    ? userFriendlyMessage
    : undefined;
};
