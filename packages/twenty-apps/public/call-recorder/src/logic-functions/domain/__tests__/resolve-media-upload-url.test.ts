import { describe, expect, it } from 'vitest';

import { resolveMediaUploadUrl } from 'src/logic-functions/domain/resolve-media-upload-url.util';

const ISSUED_UPLOAD_URL =
  'https://crm.example.com/file-upload/6a1f0c52-8a0e-4b8e-9f43-1f7f3c2d9e10?token=abc.def.ghi';

describe('resolveMediaUploadUrl', () => {
  it('keeps the issued upload URL when no media upload base URL is set', () => {
    expect(
      resolveMediaUploadUrl({
        issuedUploadUrl: ISSUED_UPLOAD_URL,
        mediaUploadBaseUrl: undefined,
      }).toString(),
    ).toBe(ISSUED_UPLOAD_URL);
  });

  it('sends the upload to the media upload base URL, keeping the issued path and token', () => {
    expect(
      resolveMediaUploadUrl({
        issuedUploadUrl: ISSUED_UPLOAD_URL,
        mediaUploadBaseUrl: 'http://localhost:3000',
      }).toString(),
    ).toBe(
      'http://localhost:3000/file-upload/6a1f0c52-8a0e-4b8e-9f43-1f7f3c2d9e10?token=abc.def.ghi',
    );
  });

  it('accepts a media upload base URL with a trailing slash', () => {
    expect(
      resolveMediaUploadUrl({
        issuedUploadUrl: ISSUED_UPLOAD_URL,
        mediaUploadBaseUrl: 'http://twenty-server:3000/',
      }).toString(),
    ).toBe(
      'http://twenty-server:3000/file-upload/6a1f0c52-8a0e-4b8e-9f43-1f7f3c2d9e10?token=abc.def.ghi',
    );
  });

  it('rejects a media upload base URL that is not an absolute http(s) URL', () => {
    expect(() =>
      resolveMediaUploadUrl({
        issuedUploadUrl: ISSUED_UPLOAD_URL,
        mediaUploadBaseUrl: 'localhost:3000',
      }),
    ).toThrow(/CALL_RECORDER_MEDIA_UPLOAD_BASE_URL/);
  });
});
