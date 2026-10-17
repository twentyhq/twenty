import { putFileToUploadTarget } from '@/file/utils/putFileToUploadTarget';

const UPLOAD_TARGET = {
  uploadUrl: 'https://crm.example.com/files/upload-id',
  contentType: 'image/png',
};

describe('putFileToUploadTarget', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('PUTs the file with same-origin credentials so proxy session cookies are sent to our own origin', async () => {
    const fetchMock = jest.fn(async () => ({ ok: true, status: 200 }));
    const file = new File(['content'], 'logo.png', { type: 'image/png' });
    const signal = new AbortController().signal;

    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await putFileToUploadTarget({ file, uploadTarget: UPLOAD_TARGET, signal });

    expect(fetchMock).toHaveBeenCalledWith(UPLOAD_TARGET.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': UPLOAD_TARGET.contentType },
      body: file,
      credentials: 'same-origin',
      signal,
    });
  });

  it('throws when the upload target rejects the file', async () => {
    const fetchMock = jest.fn(async () => ({ ok: false, status: 500 }));

    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(
      putFileToUploadTarget({
        file: new File(['content'], 'logo.png', { type: 'image/png' }),
        uploadTarget: UPLOAD_TARGET,
      }),
    ).rejects.toThrow(/File upload failed \(500\)/);
  });
});
