import { FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE } from '@/remote/sandbox/constants/FrontComponentSandboxMessageType';
import { type FrontComponentSandboxMessage } from '@/remote/sandbox/types/FrontComponentSandboxMessage';

export const createSandboxErrorMessageFromWorkerErrorEvent = (
  errorEvent: ErrorEvent,
): FrontComponentSandboxMessage => ({
  type: FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE.ERROR,
  message: errorEvent.message,
  filename: errorEvent.filename,
  lineno: errorEvent.lineno,
  colno: errorEvent.colno,
});
