import { FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE } from '@/remote/sandbox/constants/FrontComponentSandboxMessageType';
import { type FrontComponentSandboxMessage } from '@/remote/sandbox/types/FrontComponentSandboxMessage';

export const parseFrontComponentSandboxMessage = (
  data: unknown,
): FrontComponentSandboxMessage | null => {
  if (typeof data !== 'object' || data === null || !('type' in data)) {
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
      message: typeof message === 'string' ? message : '',
      filename: typeof filename === 'string' ? filename : undefined,
      lineno: typeof lineno === 'number' ? lineno : undefined,
      colno: typeof colno === 'number' ? colno : undefined,
    };
  }

  return null;
};
