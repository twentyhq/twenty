import { createFocusAwareRemoteConnection } from '../createFocusAwareRemoteConnection';

describe('createFocusAwareRemoteConnection', () => {
  it('blocks browser top-layer methods while preserving ordinary calls', () => {
    const connection = { mutate: jest.fn(), call: jest.fn() };
    const hostFocusController = {
      callFocusMethod: jest.fn(),
      retryPendingFocus: jest.fn(),
      reset: jest.fn(),
    };
    const remoteConnection = createFocusAwareRemoteConnection({
      connection,
      hostFocusController,
    });

    for (const methodName of [
      'showModal',
      'showPopover',
      'togglePopover',
      'requestFullscreen',
    ]) {
      remoteConnection.call('portal', methodName);
    }
    expect(connection.call).not.toHaveBeenCalled();

    remoteConnection.call('portal', 'focus', { preventScroll: true });
    expect(hostFocusController.callFocusMethod).toHaveBeenCalledWith({
      remoteElementId: 'portal',
      methodName: 'focus',
      options: { preventScroll: true },
    });
    remoteConnection.call('portal', 'scrollIntoView');
    expect(connection.call).toHaveBeenCalledWith('portal', 'scrollIntoView');
  });
});
