import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';

import { uploadMessageAttachment } from '@/sdk/logic-function/messaging/upload-message-attachment';

const UPLOAD_URL = 'https://storage.test/upload/pending-file';

const toGraphqlResponse = (data: Record<string, unknown>) =>
  new Response(JSON.stringify({ data }), { status: 200 });

describe('uploadMessageAttachment', () => {
  let fetchSpy: MockInstance<typeof fetch>;

  beforeEach(() => {
    vi.stubEnv('TWENTY_API_URL', 'https://api.test');
    vi.stubEnv('TWENTY_APP_ACCESS_TOKEN', 'app-token');
    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    fetchSpy.mockRestore();
  });

  it('uploads into the message attachments field and returns what ingestMessages expects', async () => {
    fetchSpy
      .mockResolvedValueOnce(
        toGraphqlResponse({
          createFileUpload: {
            fileId: 'pending-file',
            uploadUrl: UPLOAD_URL,
            contentType: 'image/png',
          },
        }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(
        toGraphqlResponse({ completeFileUpload: { id: 'stored-file' } }),
      );

    const attachment = await uploadMessageAttachment({
      filename: 'photo.png',
      content: new Uint8Array([1, 2, 3]),
    });

    expect(attachment).toEqual({ fileId: 'stored-file', label: 'photo.png' });

    const [createUrl, createInit] = fetchSpy.mock.calls[0];

    expect(createUrl).toBe('https://api.test/metadata');
    expect(JSON.parse(createInit?.body as string).variables).toEqual({
      filename: 'photo.png',
      size: 3,
      fieldMetadataUniversalIdentifier:
        STANDARD_OBJECTS.message.fields.attachments.universalIdentifier,
    });

    const [uploadUrl, uploadInit] = fetchSpy.mock.calls[1];

    expect(uploadUrl).toBe(UPLOAD_URL);
    expect(uploadInit?.method).toBe('PUT');

    const [, completeInit] = fetchSpy.mock.calls[2];

    expect(JSON.parse(completeInit?.body as string).variables).toEqual({
      fileId: 'pending-file',
    });
  });

  it('does not complete an upload the storage refused', async () => {
    fetchSpy
      .mockResolvedValueOnce(
        toGraphqlResponse({
          createFileUpload: {
            fileId: 'pending-file',
            uploadUrl: UPLOAD_URL,
            contentType: 'image/png',
          },
        }),
      )
      .mockResolvedValueOnce(
        new Response('denied', { status: 403, statusText: 'Forbidden' }),
      );

    await expect(
      uploadMessageAttachment({
        filename: 'photo.png',
        content: new Uint8Array([1, 2, 3]),
      }),
    ).rejects.toThrow('HTTP 403 Forbidden');

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});
