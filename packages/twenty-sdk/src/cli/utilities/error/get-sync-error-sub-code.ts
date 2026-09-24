import { isNonEmptyString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

export const getSyncErrorSubCode = (error: unknown): string | undefined => {
  if (!isPlainObject(error)) {
    return undefined;
  }

  return isNonEmptyString(error.subCode) ? error.subCode : undefined;
};
