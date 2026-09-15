import { isNonEmptyString } from '@sniptt/guards';
import { CustomError, isDefined } from 'twenty-shared/utils';

import { type ClonableErrorPayload } from '@/types/ClonableErrorPayload';

export const rehydrateClonableError = (
  payload: ClonableErrorPayload,
): Error => {
  const error = isNonEmptyString(payload.code)
    ? new CustomError(payload.message, payload.code)
    : new Error(payload.message);

  error.name = payload.name;

  if (isDefined(payload.stack)) {
    error.stack = payload.stack;
  }

  return error;
};
