import { type FrontComponentMediaPermissionRequest } from '@/front-components/media-session/types/FrontComponentMediaPermissionRequest';
import { waitForFrontComponentMediaPermission } from '@/front-components/media-session/utils/waitForFrontComponentMediaPermission';

describe('waitForFrontComponentMediaPermission', () => {
  it('resolves approval and removes the pending popup', async () => {
    const onRequestChange = jest.fn();
    const pending = waitForFrontComponentMediaPermission({
      capabilities: ['microphone'],
      abortSignal: new AbortController().signal,
      onRequestChange,
    });
    const request: FrontComponentMediaPermissionRequest =
      onRequestChange.mock.calls[0][0];

    request.resolve(['microphone']);

    await expect(pending).resolves.toEqual(['microphone']);
    expect(onRequestChange).toHaveBeenLastCalledWith(null);
  });

  it('closes cancelled requests and ignores a late approval', async () => {
    const controller = new AbortController();
    const onRequestChange = jest.fn();
    const pending = waitForFrontComponentMediaPermission({
      capabilities: ['camera'],
      abortSignal: controller.signal,
      onRequestChange,
    });
    const request: FrontComponentMediaPermissionRequest =
      onRequestChange.mock.calls[0][0];

    controller.abort();
    request.resolve(['camera']);

    await expect(pending).resolves.toBeNull();
    expect(onRequestChange).toHaveBeenCalledTimes(2);
    expect(onRequestChange).toHaveBeenLastCalledWith(null);
  });

  it('does not open a popup after cancellation', async () => {
    const controller = new AbortController();
    controller.abort();
    const onRequestChange = jest.fn();

    await expect(
      waitForFrontComponentMediaPermission({
        capabilities: ['microphone'],
        abortSignal: controller.signal,
        onRequestChange,
      }),
    ).resolves.toBeNull();
    expect(onRequestChange).not.toHaveBeenCalled();
  });
});
