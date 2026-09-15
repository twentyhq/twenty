import { CustomError } from 'twenty-shared/utils';

import { FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE } from '@/remote/sandbox/constants/FrontComponentSandboxMessageType';
import { createFrontComponentSandboxMessageHandler } from '../createFrontComponentSandboxMessageHandler';

const createHandlerHarness = () => {
  const contentWindow = { postMessage: jest.fn() };
  const sandboxIframe = { contentWindow } as unknown as HTMLIFrameElement;
  const workerMessagePort = {} as MessagePort;
  const onSandboxError = jest.fn();

  const handleSandboxMessage = createFrontComponentSandboxMessageHandler({
    sandboxIframe,
    workerMessagePort,
    onSandboxError,
  });

  const dispatchSandboxMessage = (data: unknown) =>
    handleSandboxMessage({
      source: contentWindow,
      data,
    } as unknown as MessageEvent);

  return {
    contentWindow,
    workerMessagePort,
    onSandboxError,
    handleSandboxMessage,
    dispatchSandboxMessage,
  };
};

describe('createFrontComponentSandboxMessageHandler', () => {
  it('should post INIT with the worker port when READY arrives from the sandbox', () => {
    const { contentWindow, workerMessagePort, dispatchSandboxMessage } =
      createHandlerHarness();

    dispatchSandboxMessage({
      type: FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE.READY,
    });

    expect(contentWindow.postMessage).toHaveBeenCalledWith(
      { type: FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE.INIT },
      '*',
      [workerMessagePort],
    );
  });

  it('should transfer the worker port only once when duplicate READY messages arrive', () => {
    const { contentWindow, dispatchSandboxMessage } = createHandlerHarness();

    dispatchSandboxMessage({
      type: FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE.READY,
    });
    dispatchSandboxMessage({
      type: FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE.READY,
    });

    expect(contentWindow.postMessage).toHaveBeenCalledTimes(1);
  });

  it('should call onSandboxError with a coded error when an ERROR message arrives', () => {
    const { onSandboxError, dispatchSandboxMessage } = createHandlerHarness();

    dispatchSandboxMessage({
      type: FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE.ERROR,
      message: 'worker exploded',
    });

    expect(onSandboxError).toHaveBeenCalledTimes(1);
    const [error] = onSandboxError.mock.calls[0];
    expect(error).toBeInstanceOf(CustomError);
    expect(error.message).toBe('worker exploded');
    expect(error.code).toBe('FRONT_COMPONENT_WORKER_ERROR');
  });

  it('should fall back to the unknown worker error message when ERROR has no message', () => {
    const { onSandboxError, dispatchSandboxMessage } = createHandlerHarness();

    dispatchSandboxMessage({
      type: FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE.ERROR,
    });

    const [error] = onSandboxError.mock.calls[0];
    expect(error.message).toBe('Unknown front component worker error');
  });

  it('should ignore events whose source is not the sandbox content window', () => {
    const { contentWindow, onSandboxError, handleSandboxMessage } =
      createHandlerHarness();

    handleSandboxMessage({
      source: {},
      data: { type: FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE.READY },
    } as unknown as MessageEvent);

    expect(contentWindow.postMessage).not.toHaveBeenCalled();
    expect(onSandboxError).not.toHaveBeenCalled();
  });

  it('should ignore junk message data', () => {
    const { contentWindow, onSandboxError, dispatchSandboxMessage } =
      createHandlerHarness();

    dispatchSandboxMessage(null);
    dispatchSandboxMessage('unrelated');
    dispatchSandboxMessage({ type: 'unrelated-message' });

    expect(contentWindow.postMessage).not.toHaveBeenCalled();
    expect(onSandboxError).not.toHaveBeenCalled();
  });
});
