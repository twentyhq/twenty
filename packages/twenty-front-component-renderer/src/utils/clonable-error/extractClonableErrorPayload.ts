import { isObject, isString } from '@sniptt/guards';

import { FRONT_COMPONENT_THREAD_ERROR_MARKER } from '@/constants/FrontComponentThreadErrorMarker';
import { type ClonableErrorPayload } from '@/types/ClonableErrorPayload';

export const extractClonableErrorPayload = (
  value: object,
): ClonableErrorPayload | null => {
  if (!(FRONT_COMPONENT_THREAD_ERROR_MARKER in value)) {
    return null;
  }

  const payload = value[FRONT_COMPONENT_THREAD_ERROR_MARKER];

  if (!isObject(payload)) {
    return null;
  }

  const { name, message, stack, code } = payload as {
    name?: unknown;
    message?: unknown;
    stack?: unknown;
    code?: unknown;
  };

  if (!isString(name) || !isString(message)) {
    return null;
  }

  return {
    name,
    message,
    stack: isString(stack) ? stack : undefined,
    code: isString(code) ? code : undefined,
  };
};
