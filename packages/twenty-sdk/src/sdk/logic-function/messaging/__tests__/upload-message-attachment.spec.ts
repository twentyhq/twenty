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

import { ATTACHMENT_FILE_FIELD_UNIVERSAL_IDENTIFIER } from '@/sdk/logic-function/messaging/attachment-file-field-universal-identifier.constant';
import { uploadMessageAttachment } from '@/sdk/logic-function/messaging/upload-message-attachment';

const UPLOAD_URL = 'https://storage.test/upload/pending-file';

const toGraphqlResponse = (data: Record<string, unknown>) =>
  new Response(JSON.stringify({ data }), { status: 200 });

const readGraphqlVariables = async (body: BodyInit | null | undefined) =>
  JSON.parse(await new Response(body).text()).variables;

describe('ATTACHMENT_FILE_FIELD_UNIVERSAL_IDENTIFIER', () => {
  it('matches the standard message attachments field', () => {
    expect(ATTACHMENT_FILE_FIELD_UNIVERSAL_IDENTIFIER).toBe(
      STANDARD_OBJECTS.attachment.fields.file.universalIdentifier,
    );
  });
});

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

    const content = new Uint8Array([1, 2, 3]);

    const attachment = await uploadMessageAttachment({
      filename: 'photo.png',
      content,
    });

    expect(attachment).toEqual({ fileId: 'stored-file', label: 'photo.png' });

    const [createUrl, createInit] = fetchSpy.mock.calls[0];

    expect(createUrl).toBe('https://api.test/metadata');
    expect(await readGraphqlVariables(createInit?.body)).toEqual({
      filename: 'photo.png',
      size: 3,
      fieldMetadataUniversalIdentifier:
        STANDARD_OBJECTS.attachment.fields.file.universalIdentifier,
    });

    const [uploadUrl, uploadInit] = fetchSpy.mock.calls[1];

    expect(uploadUrl).toBe(UPLOAD_URL);
    expect(uploadInit?.method).toBe('PUT');
    expect(new Headers(uploadInit?.headers).get('Content-Type')).toBe(
      'image/png',
    );
    expect(uploadInit?.body).toBe(content);

    const [, completeInit] = fetchSpy.mock.calls[2];

    expect(await readGraphqlVariables(completeInit?.body)).toEqual({
      fileId: 'pending-file',
    });
  });

  it.each(['', 'a'.repeat(256)])(
    'refuses a filename ingestMessages would reject before uploading anything',
    async (filename) => {
      await expect(
        uploadMessageAttachment({
          filename,
          content: new Uint8Array([1, 2, 3]),
        }),
      ).rejects.toThrow('filename must be 1 to 255 characters long');

      expect(fetchSpy).not.toHaveBeenCalled();
    },
  );

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
    ).rejects.toThrow('403 Forbidden');

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});
