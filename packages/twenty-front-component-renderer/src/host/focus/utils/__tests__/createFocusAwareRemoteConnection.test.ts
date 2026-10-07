import { createFocusAwareRemoteConnection } from '../createFocusAwareRemoteConnection';

const createConnectionUnderTest = () => {
  const connection = { mutate: jest.fn() };
  const hostFocusController = {
    callFocusMethod: jest.fn(),
    retryPendingFocus: jest.fn(),
    reset: jest.fn(),
  };

  return {
    connection,
    hostFocusController,
    remoteConnection: createFocusAwareRemoteConnection({
      connection,
      hostFocusController,
    }),
  };
};

describe('createFocusAwareRemoteConnection', () => {
  it('routes focus and blur to the host focus controller', () => {
    const { hostFocusController, remoteConnection } =
      createConnectionUnderTest();

    remoteConnection.call('portal', 'focus', { preventScroll: true });
    remoteConnection.call('portal', 'blur');

    expect(hostFocusController.callFocusMethod).toHaveBeenNthCalledWith(1, {
      remoteElementId: 'portal',
      methodName: 'focus',
      options: { preventScroll: true },
    });
    expect(hostFocusController.callFocusMethod).toHaveBeenNthCalledWith(2, {
      remoteElementId: 'portal',
      methodName: 'blur',
      options: undefined,
    });
  });

  it('rejects every other host element method, including top-layer ones', () => {
    const { hostFocusController, remoteConnection } =
      createConnectionUnderTest();

    for (const methodName of [
      'showModal',
      'showPopover',
      'togglePopover',
      'requestFullscreen',
      'webkitRequestFullscreen',
      'scrollIntoView',
    ]) {
      expect(() => remoteConnection.call('portal', methodName)).toThrow(
        `Front components cannot call ${methodName}() on host elements`,
      );
    }
    expect(hostFocusController.callFocusMethod).not.toHaveBeenCalled();
  });

  it('forwards mutations to the receiver connection', () => {
    const { connection, remoteConnection } = createConnectionUnderTest();

    remoteConnection.mutate([]);

    expect(connection.mutate).toHaveBeenCalledWith([]);
  });
});
