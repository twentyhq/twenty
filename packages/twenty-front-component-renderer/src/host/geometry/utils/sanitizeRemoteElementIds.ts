import { isArray, isNonEmptyString } from '@sniptt/guards';

export const sanitizeRemoteElementIds = (
  remoteElementIds: unknown,
): string[] => {
  if (!isArray(remoteElementIds)) {
    return [];
  }

  return remoteElementIds.filter(isNonEmptyString);
};
