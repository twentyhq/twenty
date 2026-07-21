import { type FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE } from '@/remote/sandbox/constants/FrontComponentSandboxMessageType';

export type FrontComponentSandboxMessage =
  | { type: typeof FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE.READY }
  | { type: typeof FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE.INIT }
  | {
      type: typeof FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE.ERROR;
      message: string;
      filename?: string;
      lineno?: number;
      colno?: number;
    };
