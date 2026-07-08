import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createAttachment } from '../create-attachment';
import { uploadFile } from '../upload-file';

const buildGraphqlResponse = (data: unknown): Response =>
  new Response(JSON.stringify({ data }), { status: 200 });

const UPLOADED_FILE = {
  id: 'file-id',
  path: 'attachment-file/file-id',
  size: 4,
  createdAt: '2026-01-01T00:00:00.000Z',
  url: 'https://api.twenty.test/files/attachment-file/file-id',
};

describe('files', () => {
  const originalProcess = (globalThis as Record<string, unknown>).process;

  beforeEach(() => {
    (globalThis as Record<string, unknown>).process = {
      env: {
        TWENTY_API_URL: 'https://api.twenty.test',
        TWENTY_APP_ACCESS_TOKEN: 'app-access-token',
      },
    };
  });

  afterEach(() => {
    (globalThis as Record<string, unknown>).process = originalProcess;
    vi.restoreAllMocks();
  });

  describe('uploadFile', () => {
    it('should post a multipart upload to the metadata endpoint with a bearer token', async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        buildGraphqlResponse({
          uploadFilesFieldFileByUniversalIdentifier: UPLOADED_FILE,
        }),
      );
      vi.stubGlobal('fetch', fetchMock);

      const uploadedFile = await uploadFile({
        source: {
          data: new Uint8Array([1, 2, 3, 4]),
          contentType: 'audio/mpeg',
        },
        filename: 'audio.mp3',
        fieldMetadataUniversalIdentifier: 'field-universal-identifier',
      });

      expect(uploadedFile).toEqual(UPLOADED_FILE);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      const [url, requestInit] = fetchMock.mock.calls[0];
      expect(url).toBe('https://api.twenty.test/metadata');
      expect(requestInit.method).toBe('POST');
      expect(requestInit.headers.Authorization).toBe('Bearer app-access-token');

      const form = requestInit.body as FormData;
      const operations = JSON.parse(form.get('operations') as string);
      expect(operations.variables).toEqual({
        file: null,
        fieldMetadataUniversalIdentifier: 'field-universal-identifier',
      });
      expect(JSON.parse(form.get('map') as string)).toEqual({
        '0': ['variables.file'],
      });

      const uploadedBlob = form.get('0') as File;
      expect(uploadedBlob.name).toBe('audio.mp3');
      expect(uploadedBlob.type).toBe('audio/mpeg');
    });

    it('should download the file first when the source is a url', async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(
          new Response(new Blob(['pdf-bytes'], { type: 'application/pdf' })),
        )
        .mockResolvedValueOnce(
          buildGraphqlResponse({
            uploadFilesFieldFileByUniversalIdentifier: UPLOADED_FILE,
          }),
        );
      vi.stubGlobal('fetch', fetchMock);

      await uploadFile({
        source: { url: 'https://pdf-service.test/quote.pdf' },
        filename: 'quote.pdf',
        fieldMetadataUniversalIdentifier: 'field-universal-identifier',
      });

      expect(fetchMock.mock.calls[0][0]).toBe(
        'https://pdf-service.test/quote.pdf',
      );
      expect(fetchMock.mock.calls[1][0]).toBe(
        'https://api.twenty.test/metadata',
      );
    });

    it('should throw when the source url download fails', async () => {
      vi.stubGlobal(
        'fetch',
        vi
          .fn()
          .mockResolvedValue(
            new Response('not found', { status: 404, statusText: 'Not Found' }),
          ),
      );

      await expect(
        uploadFile({
          source: { url: 'https://pdf-service.test/missing.pdf' },
          filename: 'missing.pdf',
          fieldMetadataUniversalIdentifier: 'field-universal-identifier',
        }),
      ).rejects.toThrow('HTTP 404');
    });

    it('should throw when the runtime env vars are missing', async () => {
      (globalThis as Record<string, unknown>).process = { env: {} };
      vi.stubGlobal('fetch', vi.fn());

      await expect(
        uploadFile({
          source: { data: new Uint8Array([1]) },
          filename: 'file.bin',
          fieldMetadataUniversalIdentifier: 'field-universal-identifier',
        }),
      ).rejects.toThrow('TWENTY_API_URL');
    });

    it('should throw with the graphql error message when the upload is rejected', async () => {
      vi.stubGlobal(
        'fetch',
        vi
          .fn()
          .mockResolvedValue(
            new Response(
              JSON.stringify({ errors: [{ message: 'File too large' }] }),
              { status: 200 },
            ),
          ),
      );

      await expect(
        uploadFile({
          source: { data: new Uint8Array([1]) },
          filename: 'file.bin',
          fieldMetadataUniversalIdentifier: 'field-universal-identifier',
        }),
      ).rejects.toThrow('uploadFile() failed: File too large');
    });
  });

  describe('createAttachment', () => {
    it('should upload to the attachment file field and link the record target', async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(
          buildGraphqlResponse({
            uploadFilesFieldFileByUniversalIdentifier: UPLOADED_FILE,
          }),
        )
        .mockResolvedValueOnce(
          buildGraphqlResponse({
            createAttachment: { id: 'attachment-id', name: 'quote.pdf' },
          }),
        );
      vi.stubGlobal('fetch', fetchMock);

      const attachment = await createAttachment({
        source: {
          data: new Uint8Array([1, 2]),
          contentType: 'application/pdf',
        },
        filename: 'quote.pdf',
        target: { objectNameSingular: 'company', recordId: 'company-id' },
      });

      expect(attachment).toEqual({ id: 'attachment-id', name: 'quote.pdf' });

      const uploadForm = fetchMock.mock.calls[0][1].body as FormData;
      const uploadOperations = JSON.parse(
        uploadForm.get('operations') as string,
      );
      expect(uploadOperations.variables.fieldMetadataUniversalIdentifier).toBe(
        '20202020-15db-460e-8166-c7b5d87ad4be',
      );

      const [createUrl, createRequestInit] = fetchMock.mock.calls[1];
      expect(createUrl).toBe('https://api.twenty.test/graphql');

      const createBody = JSON.parse(createRequestInit.body as string);
      expect(createBody.variables.data).toEqual({
        name: 'quote.pdf',
        file: [{ fileId: 'file-id', label: 'quote.pdf' }],
        targetCompanyId: 'company-id',
      });
    });
  });
});
