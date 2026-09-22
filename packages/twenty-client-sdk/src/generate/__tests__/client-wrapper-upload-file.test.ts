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

const uploadedThroughApiFile = {
  ...uploadedFile,
  id: 'api-file-id',
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

const readMultipartBody = async (requestInit: RequestInit | undefined) => {
  const form = requestInit?.body as FormData;

  return {
    operations: JSON.parse(String(form.get('operations'))) as {
      query: string;
      variables: Record<string, unknown>;
    },
    map: JSON.parse(String(form.get('map'))) as Record<string, string[]>,
    sentFile: form.get('0') as File,
  };
};

const createFetchMock = ({
  putResponse = () => new Response(null, { status: 200 }),
  createFileUploadResponse = () =>
    createJsonResponse({ body: { data: { createFileUpload: uploadTarget } } }),
  multipartResponse = () =>
    createJsonResponse({
      body: {
        data: {
          uploadFilesFieldFileByUniversalIdentifier: uploadedThroughApiFile,
        },
      },
    }),
}: {
  putResponse?: () => Response;
  createFileUploadResponse?: () => Response;
  multipartResponse?: () => Response;
} = {}) => {
  const capturedRequests: CapturedRequest[] = [];

  const fetchMock = vi.fn(
    async (url: string | URL | Request, requestInit?: RequestInit) => {
      capturedRequests.push({ url: String(url), requestInit });

      if (requestInit?.method === 'PUT') {
        return putResponse();
      }

      if (requestInit?.body instanceof FormData) {
        return multipartResponse();
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

const refusedUploadTargetResponse = () =>
  createJsonResponse({
    body: {
      errors: [
        { message: 'The file is empty or exceeds the maximum allowed size.' },
      ],
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

  it('falls back to the upload through the API when the upload target is refused', async () => {
    const { fetchMock, capturedRequests } = createFetchMock({
      createFileUploadResponse: refusedUploadTargetResponse,
    });
    const fileBuffer = Buffer.from('content');

    const result = await uploadInvoice(createClient(fetchMock), fileBuffer);

    expect(result).toEqual(uploadedThroughApiFile);
    expect(capturedRequests).toHaveLength(2);

    const [, multipartRequest] = capturedRequests;

    expect(multipartRequest.url).toBe(CLIENT_URL);
    expect(multipartRequest.requestInit?.method).toBe('POST');
    expect(getAuthorizationHeaderValue(multipartRequest.requestInit)).toBe(
      'Bearer application-token',
    );

    const { operations, map, sentFile } = await readMultipartBody(
      multipartRequest.requestInit,
    );

    expect(operations.query).toContain(
      'uploadFilesFieldFileByUniversalIdentifier',
    );
    expect(operations.variables).toEqual({
      file: null,
      fieldMetadataUniversalIdentifier: FIELD_METADATA_UNIVERSAL_IDENTIFIER,
    });
    expect(map).toEqual({ '0': ['variables.file'] });
    expect(sentFile.name).toBe('invoice.pdf');
    expect(sentFile.type).toBe('application/pdf');
    expect(Buffer.from(await sentFile.arrayBuffer())).toEqual(fileBuffer);
  });

  it('falls back to the upload through the API when storage refuses the bytes', async () => {
    const { fetchMock, capturedRequests } = createFetchMock({
      putResponse: () =>
        new Response('<Error>SignatureDoesNotMatch</Error>', {
          status: 403,
          statusText: 'Forbidden',
        }),
    });

    const result = await uploadInvoice(createClient(fetchMock));

    expect(result).toEqual(uploadedThroughApiFile);
    expect(
      capturedRequests.map(({ requestInit }) => requestInit?.method),
    ).toEqual(['POST', 'PUT', 'POST']);
    expect(capturedRequests[2].requestInit?.body).toBeInstanceOf(FormData);
  });

  it('surfaces the API upload error when both uploads fail', async () => {
    const { fetchMock, capturedRequests } = createFetchMock({
      createFileUploadResponse: refusedUploadTargetResponse,
      multipartResponse: () =>
        createJsonResponse({
          body: {
            errors: [{ message: 'Upload through the API refused' }],
            data: null,
          },
        }),
    });

    await expect(uploadInvoice(createClient(fetchMock))).rejects.toThrow(
      'GenqlError',
    );

    expect(capturedRequests).toHaveLength(2);
  });

  it('uploads through the API only when deprecatedUploadFile is called', async () => {
    const { fetchMock, capturedRequests } = createFetchMock();
    const fileBuffer = Buffer.from('content');

    const result = await createClient(fetchMock).deprecatedUploadFile(
      fileBuffer,
      'invoice.pdf',
      'application/pdf',
      FIELD_METADATA_UNIVERSAL_IDENTIFIER,
    );

    expect(result).toEqual(uploadedThroughApiFile);
    expect(capturedRequests).toHaveLength(1);

    const { sentFile } = await readMultipartBody(
      capturedRequests[0].requestInit,
    );

    expect(sentFile.name).toBe('invoice.pdf');
    expect(sentFile.type).toBe('application/pdf');
    expect(Buffer.from(await sentFile.arrayBuffer())).toEqual(fileBuffer);
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

    const result = await uploadInvoice(createClient(fetchMock));

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
