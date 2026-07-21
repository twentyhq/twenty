import { isNumber, isObject, isString } from '@sniptt/guards';

import { FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE } from '@/remote/sandbox/constants/FrontComponentSandboxMessageType';
import { type FrontComponentSandboxMessage } from '@/remote/sandbox/types/FrontComponentSandboxMessage';

export const parseFrontComponentSandboxMessage = (
  data: unknown,
): FrontComponentSandboxMessage | null => {
  if (!isObject(data) || !('type' in data)) {
    return null;
  }

  const { type } = data as { type: unknown };

  if (
    type === FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE.READY ||
    type === FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE.INIT
  ) {
    return { type };
  }

  if (type === FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE.ERROR) {
    const { message, filename, lineno, colno } = data as {
      message?: unknown;
      filename?: unknown;
      lineno?: unknown;
      colno?: unknown;
    };

    return {
      type,
      message: isString(message) ? message : '',
      filename: isString(filename) ? filename : undefined,
      lineno: isNumber(lineno) ? lineno : undefined,
      colno: isNumber(colno) ? colno : undefined,
    };
  }

  return null;
};
