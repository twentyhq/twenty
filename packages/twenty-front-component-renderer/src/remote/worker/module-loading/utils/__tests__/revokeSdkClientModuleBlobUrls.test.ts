import { revokeSdkClientModuleBlobUrls } from '../revokeSdkClientModuleBlobUrls';

const originalRevokeObjectUrl = URL.revokeObjectURL;

describe('revokeSdkClientModuleBlobUrls', () => {
  afterEach(() => {
    URL.revokeObjectURL = originalRevokeObjectUrl;
  });

  it('should revoke both the core and metadata blob urls', () => {
    const revokeObjectUrlSpy = jest.fn();
    URL.revokeObjectURL = revokeObjectUrlSpy;

    revokeSdkClientModuleBlobUrls({
      core: 'blob:core-url',
      metadata: 'blob:metadata-url',
    });

    expect(revokeObjectUrlSpy).toHaveBeenCalledWith('blob:core-url');
    expect(revokeObjectUrlSpy).toHaveBeenCalledWith('blob:metadata-url');
    expect(revokeObjectUrlSpy).toHaveBeenCalledTimes(2);
  });
});
