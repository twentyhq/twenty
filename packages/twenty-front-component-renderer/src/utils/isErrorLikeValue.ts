import { isObject, isString } from '@sniptt/guards';

import { type ErrorLikeValue } from '@/types/ErrorLikeValue';

export const isErrorLikeValue = (value: unknown): value is ErrorLikeValue => {
  if (value instanceof Error) {
    return true;
  }

  if (typeof DOMException !== 'undefined' && value instanceof DOMException) {
    return true;
  }

  if (!isObject(value)) {
    return false;
  }

  const { name, message, stack } = value as {
    name?: unknown;
    message?: unknown;
    stack?: unknown;
  };

  return isString(name) && isString(message) && isString(stack);
};
