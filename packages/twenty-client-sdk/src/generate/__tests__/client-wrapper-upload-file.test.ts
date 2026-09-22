import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  createJsonResponse,
  type GeneratedClientClass,
  getAuthorizationHeaderValue,
  loadGeneratedClientClass,
} from './generated-client-test-helpers';

const CLIENT_URL = 'https://example.com/metadata';
const FIELD_METADATA_UNIVERSAL_IDENTIFIER = 'field-universal-identifier';

const uploadTarget = {
  fileId: 'file-id',
  uploadUrl: 'https://storage.example.com/pending/file-id?signature=abc',
  contentType: 'application/octet-stream',
};

const uploadedFile = {
  id: 'file-id',
  path: 'files-field/field-universal-identifier/file-id.pdf',
  size: 7,
  createdAt: '2026-02-24T00:00:00.000Z',
  url: 'https://example.com/file/files-field/file-id?token=xyz',
};

type CapturedRequest = {
  url: string;
  requestInit: RequestInit | undefined;
};

const parseGraphqlBody = (requestInit: RequestInit | undefined) =>
  JSON.parse(String(requestInit?.body)) as {
    query: string;
    variables: Record<string, unknown>;
  };

const createFetchMock = ({
  putResponse = () => new Response(null, { status: 200 }),
  createFileUploadResponse = () =>
    createJsonResponse({ body: { data: { createFileUpload: uploadTarget } } }),
  completeFileUploadResponse = () =>
    createJsonResponse({
      body: { data: { completeFileUpload: uploadedFile } },
    }),
}: {
  putResponse?: () => Response;
  createFileUploadResponse?: () => Response;
  completeFileUploadResponse?: () => Response;
} = {}) => {
  const capturedRequests: CapturedRequest[] = [];

  const fetchMock = vi.fn(
    async (url: string | URL | Request, requestInit?: RequestInit) => {
      capturedRequests.push({ url: String(url), requestInit });

      if (requestInit?.method === 'PUT') {
        return putResponse();
      }

      if (requestInit?.body instanceof FormData) {
        throw new Error('Unexpected multipart request');
      }

      const { query } = parseGraphqlBody(requestInit);

      if (query.includes('createFileUpload')) {
        return createFileUploadResponse();
      }

      if (query.includes('completeFileUpload')) {
        return completeFileUploadResponse();
      }

      throw new Error(`Unexpected GraphQL operation: ${query}`);
    },
  );

  return { fetchMock, capturedRequests };
};

const refusedMutationResponse = (message: string) => () =>
  createJsonResponse({
    body: {
      errors: [{ message }],
      data: null,
    },
  });

describe('Generated client wrapper uploadFile', () => {
  let TwentyClass: GeneratedClientClass;
  let cleanup: () => Promise<void>;

  const createClient = (fetchMock: ReturnType<typeof vi.fn>) =>
    new TwentyClass({
      url: CLIENT_URL,
      fetch: fetchMock as unknown as typeof globalThis.fetch,
    });

  const uploadInvoice = (
    twentyClient: InstanceType<GeneratedClientClass>,
    fileBuffer = Buffer.from('content'),
  ) =>
    twentyClient.uploadFile(
      fileBuffer,
      'invoice.pdf',
      'application/pdf',
      FIELD_METADATA_UNIVERSAL_IDENTIFIER,
    );

  beforeAll(async () => {
    ({ GeneratedClientClass: TwentyClass, cleanup } =
      await loadGeneratedClientClass());
  });

  beforeEach(() => {
    process.env.TWENTY_APP_ACCESS_TOKEN = 'application-token';
    delete process.env.TWENTY_APP_APPLICATION_ACCESS_TOKEN;
    delete process.env.TWENTY_API_KEY;
    delete (globalThis as Record<string, unknown>)
      .frontComponentHostCommunicationApi;
  });

  afterAll(async () => {
    await cleanup();
  });

  it('creates an upload target, sends the bytes to it, then completes the upload', async () => {
    const { fetchMock, capturedRequests } = createFetchMock();
    const fileBuffer = Buffer.from('content');

    const result = await uploadInvoice(createClient(fetchMock), fileBuffer);

    expect(result).toEqual(uploadedFile);
    expect(capturedRequests).toHaveLength(3);

    const [createRequest, putRequest, completeRequest] = capturedRequests;

    expect(createRequest.url).toBe(CLIENT_URL);
    expect(getAuthorizationHeaderValue(createRequest.requestInit)).toBe(
      'Bearer application-token',
    );
    const createBody = parseGraphqlBody(createRequest.requestInit);
    expect(createBody.query).toContain('fileFolder: FilesField');
    expect(createBody.variables).toEqual({
      filename: 'invoice.pdf',
      size: fileBuffer.byteLength,
      fieldMetadataUniversalIdentifier: FIELD_METADATA_UNIVERSAL_IDENTIFIER,
    });

    expect(putRequest.url).toBe(uploadTarget.uploadUrl);
    expect(putRequest.requestInit?.method).toBe('PUT');
    expect(putRequest.requestInit?.body).toBe(fileBuffer);
    expect(
      new Headers(putRequest.requestInit?.headers).get('Content-Type'),
    ).toBe(uploadTarget.contentType);
    expect(getAuthorizationHeaderValue(putRequest.requestInit)).toBeNull();

    expect(completeRequest.url).toBe(CLIENT_URL);
    expect(getAuthorizationHeaderValue(completeRequest.requestInit)).toBe(
      'Bearer application-token',
    );
    expect(parseGraphqlBody(completeRequest.requestInit).variables).toEqual({
      fileId: uploadTarget.fileId,
    });
  });

  it('sends nothing to storage when the upload target is refused', async () => {
    const { fetchMock, capturedRequests } = createFetchMock({
      createFileUploadResponse: refusedMutationResponse(
        'The file is empty or exceeds the maximum allowed size.',
      ),
    });

    await expect(uploadInvoice(createClient(fetchMock))).rejects.toThrow(
      'GenqlError',
    );

    expect(capturedRequests).toHaveLength(1);
  });

  it('does not complete the upload when storage refuses the bytes', async () => {
    const { fetchMock, capturedRequests } = createFetchMock({
      putResponse: () =>
        new Response('<Error>SignatureDoesNotMatch</Error>', {
          status: 403,
          statusText: 'Forbidden',
        }),
    });

    await expect(uploadInvoice(createClient(fetchMock))).rejects.toThrow(
      'File upload failed (403 Forbidden): <Error>SignatureDoesNotMatch</Error>',
    );

    expect(
      capturedRequests.map(({ requestInit }) => requestInit?.method),
    ).toEqual(['POST', 'PUT']);
  });

  it('surfaces the completion error', async () => {
    const { fetchMock, capturedRequests } = createFetchMock({
      completeFileUploadResponse: refusedMutationResponse(
        'MIME type text/plain is not allowed in file folder FilesField',
      ),
    });

    await expect(uploadInvoice(createClient(fetchMock))).rejects.toThrow(
      'GenqlError',
    );

    expect(
      capturedRequests.map(({ requestInit }) => requestInit?.method),
    ).toEqual(['POST', 'PUT', 'POST']);
  });
});
