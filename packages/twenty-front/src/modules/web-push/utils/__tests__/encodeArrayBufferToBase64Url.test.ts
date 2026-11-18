import { encodeArrayBufferToBase64Url } from '@/web-push/utils/encodeArrayBufferToBase64Url';

describe('encodeArrayBufferToBase64Url', () => {
  it('should use the URL-safe alphabet without padding', () => {
    expect(
      encodeArrayBufferToBase64Url(new Uint8Array([251, 255, 191, 1]).buffer),
    ).toBe('-_-_AQ');
  });
});
