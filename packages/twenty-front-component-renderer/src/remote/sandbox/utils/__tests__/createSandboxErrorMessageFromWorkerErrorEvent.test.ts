import { FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE } from '@/remote/sandbox/constants/FrontComponentSandboxMessageType';
import { createSandboxErrorMessageFromWorkerErrorEvent } from '../createSandboxErrorMessageFromWorkerErrorEvent';

describe('createSandboxErrorMessageFromWorkerErrorEvent', () => {
  it('should copy the message and source location from the error event', () => {
    const errorEvent = {
      message: 'worker exploded',
      filename: 'blob:worker.js',
      lineno: 12,
      colno: 3,
    } as ErrorEvent;

    expect(createSandboxErrorMessageFromWorkerErrorEvent(errorEvent)).toEqual({
      type: FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE.ERROR,
      message: 'worker exploded',
      filename: 'blob:worker.js',
      lineno: 12,
      colno: 3,
    });
  });
});
