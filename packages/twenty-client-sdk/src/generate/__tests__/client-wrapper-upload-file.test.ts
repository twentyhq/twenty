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

const missingDirectUploadMutationResponse = () =>
  createJsonResponse({
    body: {
      errors: [
        {
          message: 'Cannot query field "createFileUpload" on type "Mutation".',
        },
      ],
    },
    status: 400,
    statusText: 'Bad Request',
  });

const createFetchMock = ({
  putResponse = () => new Response(null, { status: 200 }),
  createFileUploadResponse = () =>
    createJsonResponse({ body: { data: { createFileUpload: uploadTarget } } }),
}: {
  putResponse?: () => Response;
  createFileUploadResponse?: () => Response;
} = {}) => {
  const capturedRequests: CapturedRequest[] = [];

  const fetchMock = vi.fn(
    async (url: string | URL | Request, requestInit?: RequestInit) => {
      capturedRequests.push({ url: String(url), requestInit });

      if (requestInit?.method === 'PUT') {
        return putResponse();
      }

      if (requestInit?.body instanceof FormData) {
        return createJsonResponse({
          body: {
            data: { uploadFilesFieldFileByUniversalIdentifier: uploadedFile },
          },
        });
      }

      const { query } = parseGraphqlBody(requestInit);

      if (query.includes('createFileUpload')) {
        return createFileUploadResponse();
      }

      if (query.includes('completeFileUpload')) {
        return createJsonResponse({
          body: { data: { completeFileUpload: uploadedFile } },
        });
      }

      throw new Error(`Unexpected GraphQL operation: ${query}`);
    },
  );

  return { fetchMock, capturedRequests };
};

describe('Generated client wrapper uploadFile', () => {
  let TwentyClass: GeneratedClientClass;
  let cleanup: () => Promise<void>;

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

    const twentyClient = new TwentyClass({
      url: CLIENT_URL,
      fetch: fetchMock as unknown as typeof globalThis.fetch,
    });

    const result = await uploadInvoice(twentyClient, fileBuffer);

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

  it('falls back to the upload through the API when the server has no direct upload mutation', async () => {
    const { fetchMock, capturedRequests } = createFetchMock({
      createFileUploadResponse: missingDirectUploadMutationResponse,
    });
    const fileBuffer = Buffer.from('content');

    const twentyClient = new TwentyClass({
      url: CLIENT_URL,
      fetch: fetchMock as unknown as typeof globalThis.fetch,
    });

    const result = await uploadInvoice(twentyClient, fileBuffer);

    expect(result).toEqual(uploadedFile);
    expect(capturedRequests).toHaveLength(2);

    const [, multipartRequest] = capturedRequests;

    expect(multipartRequest.url).toBe(CLIENT_URL);
    expect(multipartRequest.requestInit?.method).toBe('POST');
    expect(getAuthorizationHeaderValue(multipartRequest.requestInit)).toBe(
      'Bearer application-token',
    );

    const form = multipartRequest.requestInit?.body as FormData;
    const operations = JSON.parse(String(form.get('operations')));

    expect(operations.query).toContain(
      'uploadFilesFieldFileByUniversalIdentifier',
    );
    expect(operations.variables).toEqual({
      file: null,
      fieldMetadataUniversalIdentifier: FIELD_METADATA_UNIVERSAL_IDENTIFIER,
    });
    expect(JSON.parse(String(form.get('map')))).toEqual({
      '0': ['variables.file'],
    });

    const sentFile = form.get('0') as File;

    expect(sentFile.name).toBe('invoice.pdf');
    expect(sentFile.type).toBe('application/pdf');
    expect(Buffer.from(await sentFile.arrayBuffer())).toEqual(fileBuffer);
  });

  it('keeps uploading through the API once the server turned out to have no direct upload mutation', async () => {
    const { fetchMock, capturedRequests } = createFetchMock({
      createFileUploadResponse: missingDirectUploadMutationResponse,
    });

    const twentyClient = new TwentyClass({
      url: CLIENT_URL,
      fetch: fetchMock as unknown as typeof globalThis.fetch,
    });

    await uploadInvoice(twentyClient);
    await uploadInvoice(twentyClient);

    expect(capturedRequests).toHaveLength(3);
    expect(capturedRequests[2].requestInit?.body).toBeInstanceOf(FormData);
  });

  it('does not complete the upload nor fall back when storage refuses the bytes', async () => {
    const { fetchMock, capturedRequests } = createFetchMock({
      putResponse: () =>
        new Response('<Error>SignatureDoesNotMatch</Error>', {
          status: 403,
          statusText: 'Forbidden',
        }),
    });

    const twentyClient = new TwentyClass({
      url: CLIENT_URL,
      fetch: fetchMock as unknown as typeof globalThis.fetch,
    });

    await expect(uploadInvoice(twentyClient)).rejects.toThrow('403 Forbidden');

    expect(capturedRequests).toHaveLength(2);
    expect(capturedRequests[1].requestInit?.method).toBe('PUT');
  });

  it('does not send any bytes nor fall back when the upload target is refused for another reason', async () => {
    const { fetchMock, capturedRequests } = createFetchMock({
      createFileUploadResponse: () =>
        createJsonResponse({
          body: {
            errors: [
              {
                message:
                  'The file is empty or exceeds the maximum allowed size.',
              },
            ],
            data: null,
          },
        }),
    });

    const twentyClient = new TwentyClass({
      url: CLIENT_URL,
      fetch: fetchMock as unknown as typeof globalThis.fetch,
    });

    await expect(uploadInvoice(twentyClient)).rejects.toThrow();

    expect(capturedRequests).toHaveLength(1);
  });

  it('refreshes the token and retries when creating the upload target is unauthenticated', async () => {
    process.env.TWENTY_APP_ACCESS_TOKEN = 'stale-token';

    const requestAccessTokenRefresh = vi
      .fn<() => Promise<string>>()
      .mockResolvedValue('fresh-token');

    (globalThis as Record<string, unknown>).frontComponentHostCommunicationApi =
      {
        requestAccessTokenRefresh,
      };

    const { fetchMock, capturedRequests } = createFetchMock();

    fetchMock.mockImplementationOnce(
      async (url: string | URL | Request, requestInit?: RequestInit) => {
        capturedRequests.push({ url: String(url), requestInit });

        return createJsonResponse({
          body: { message: 'Unauthorized' },
          status: 401,
          statusText: 'Unauthorized',
        });
      },
    );

    const twentyClient = new TwentyClass({
      url: CLIENT_URL,
      fetch: fetchMock as unknown as typeof globalThis.fetch,
    });

    const result = await uploadInvoice(twentyClient);

    expect(result).toEqual(uploadedFile);
    expect(requestAccessTokenRefresh).toHaveBeenCalledTimes(1);
    expect(
      capturedRequests.map(({ requestInit }) => requestInit?.method),
    ).toEqual(['POST', 'POST', 'PUT', 'POST']);
    expect(getAuthorizationHeaderValue(capturedRequests[0].requestInit)).toBe(
      'Bearer stale-token',
    );
    expect(getAuthorizationHeaderValue(capturedRequests[1].requestInit)).toBe(
      'Bearer fresh-token',
    );
    expect(getAuthorizationHeaderValue(capturedRequests[3].requestInit)).toBe(
      'Bearer fresh-token',
    );
  });
});
