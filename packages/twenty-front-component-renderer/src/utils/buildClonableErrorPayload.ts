import { isNonEmptyString, isString } from '@sniptt/guards';

import { type ClonableErrorPayload } from '@/types/ClonableErrorPayload';
import { isErrorLikeValue } from '@/utils/isErrorLikeValue';

const FALLBACK_ERROR_NAME = 'Error';

const stringifyErrorValue = (value: unknown): string => {
  try {
    return String(value);
  } catch {
    return FALLBACK_ERROR_NAME;
  }
};

export const buildClonableErrorPayload = (
  value: unknown,
): ClonableErrorPayload => {
  if (!isErrorLikeValue(value)) {
    return { name: FALLBACK_ERROR_NAME, message: stringifyErrorValue(value) };
  }

  const { code } = value as { code?: unknown };

  return {
    name: isNonEmptyString(value.name) ? value.name : FALLBACK_ERROR_NAME,
    message: isNonEmptyString(value.message)
      ? value.message
      : stringifyErrorValue(value),
    stack: isString(value.stack) ? value.stack : undefined,
    code: isString(code) ? code : undefined,
  };
};
