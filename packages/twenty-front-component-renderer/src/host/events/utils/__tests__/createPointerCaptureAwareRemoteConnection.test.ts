import { createHostPointerCaptureControllerStub } from '@/testing/createHostPointerCaptureControllerStub';

import { createPointerCaptureAwareRemoteConnection } from '../createPointerCaptureAwareRemoteConnection';

const createConnectionFixture = () => {
  const connection = { mutate: jest.fn(), call: jest.fn() };
  const pointerCaptureController = createHostPointerCaptureControllerStub();

  return {
    connection,
    pointerCaptureController,
    captureConnection: createPointerCaptureAwareRemoteConnection({
      connection,
      pointerCaptureController,
    }),
  };
};

describe('createPointerCaptureAwareRemoteConnection', () => {
  it('should hand worker capture requests to the host capture controller', () => {
    const { captureConnection, connection, pointerCaptureController } =
      createConnectionFixture();

    captureConnection.call('owned', 'setPointerCapture', 0, 3);
    captureConnection.call('owned', 'releasePointerCapture', 0, 3);

    expect(
      pointerCaptureController.acceptWorkerPointerCapture,
    ).toHaveBeenCalledWith({
      remoteElementId: 'owned',
      pointerId: 0,
      captureToken: 3,
    });
    expect(
      pointerCaptureController.releaseWorkerPointerCapture,
    ).toHaveBeenCalledWith({
      remoteElementId: 'owned',
      pointerId: 0,
      captureToken: 3,
    });
    expect(connection.call).not.toHaveBeenCalled();
  });

  it('should drop capture requests with malformed pointer ids or capture tokens', () => {
    const { captureConnection, connection, pointerCaptureController } =
      createConnectionFixture();

    captureConnection.call('owned', 'setPointerCapture', '1', 3);
    captureConnection.call('owned', 'setPointerCapture', Number.NaN, 3);
    captureConnection.call('owned', 'setPointerCapture', 1, () => undefined);
    captureConnection.call('owned', 'releasePointerCapture', 1);

    expect(
      pointerCaptureController.acceptWorkerPointerCapture,
    ).not.toHaveBeenCalled();
    expect(
      pointerCaptureController.releaseWorkerPointerCapture,
    ).not.toHaveBeenCalled();
    expect(connection.call).not.toHaveBeenCalled();
  });

  it('should pass unrelated calls and mutations through to the receiver connection', () => {
    const { captureConnection, connection } = createConnectionFixture();

    captureConnection.call('owned', 'focus', { preventScroll: true });
    captureConnection.mutate([]);

    expect(connection.call).toHaveBeenCalledWith('owned', 'focus', {
      preventScroll: true,
    });
    expect(connection.mutate).toHaveBeenCalledWith([]);
  });
});
