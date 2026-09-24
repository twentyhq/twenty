import { renderHook } from '@testing-library/react';
import { atom, createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useFrontComponentFileUpload } from '@/front-components/hooks/useFrontComponentFileUpload';
import { type ApplicationTokenPair } from '~/generated-metadata/graphql';

jest.mock('@/front-components/hooks/useRequestApplicationTokenRefresh', () => ({
  useRequestApplicationTokenRefresh: () => ({
    requestAccessTokenRefresh: jest.fn(),
  }),
}));

jest.mock('~/utils/sleep', () => ({
  sleep: () => Promise.resolve(),
}));

const tokenPairAtom = atom<ApplicationTokenPair | null>(null);

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState',
  () => ({
    useAtomComponentStateCallbackState: () => tokenPairAtom,
  }),
);

const FRONT_COMPONENT_ID = 'fc-test-id';
const FIELD_METADATA_ID = 'files-field-id';
const APPLICATION_ACCESS_TOKEN = 'application-access-token';
const UPLOAD_URL = 'https://storage.example/upload/file-1';

const buildTokenPair = (accessToken: string): ApplicationTokenPair => ({
  __typename: 'ApplicationTokenPair',
  applicationAccessToken: {
    __typename: 'AuthToken',
    token: accessToken,
    expiresAt: '2099-01-01T00:00:00.000Z',
  },
  applicationRefreshToken: {
    __typename: 'AuthToken',
    token: 'refresh-token',
    expiresAt: '2099-01-01T00:00:00.000Z',
  },
});

const createFileUploadPayload = {
  data: {
    createFileUpload: {
      fileId: 'file-1',
      uploadUrl: UPLOAD_URL,
      contentType: 'application/octet-stream',
      expiresAt: '2099-01-01T00:00:00.000Z',
    },
  },
};

const completedFile = {
  id: 'file-1',
  path: 'files-field/field-universal-identifier/file-1.pdf',
  size: 3,
  createdAt: '2026-01-01T00:00:00.000Z',
  url: 'https://api.example/file/files-field/file-1?token=signed',
};

const completeFileUploadPayload = {
  data: { completeFileUpload: completedFile },
};

const forbiddenPayload = {
  errors: [
    {
      message: 'User does not have permission.',
      extensions: { code: 'FORBIDDEN', subCode: 'PERMISSION_DENIED' },
    },
  ],
};

type QueuedResponse = {
  status?: number;
  payload?: unknown;
  isNetworkError?: boolean;
};

const queueFetchResponses = (...responses: QueuedResponse[]) => {
  const queue = [...responses];

  global.fetch = jest.fn(() => {
    const { status = 200, payload, isNetworkError } = queue.shift() ?? {};

    if (isNetworkError === true) {
      return Promise.reject(new TypeError('Failed to fetch'));
    }

    return Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(payload),
    } as unknown as Response);
  });
};

const getFetchCalls = () =>
  (global.fetch as jest.Mock).mock.calls as [string, RequestInit][];

const getRequestHeaders = (requestInit: RequestInit) =>
  requestInit.headers as Record<string, string>;

const getRequestVariables = (requestInit: RequestInit) =>
  JSON.parse(requestInit.body as string).variables;

const renderUseFrontComponentFileUpload = (
  store: ReturnType<typeof createStore>,
) =>
  renderHook(
    () => useFrontComponentFileUpload({ frontComponentId: FRONT_COMPONENT_ID }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <JotaiProvider store={store}>{children}</JotaiProvider>
      ),
    },
  );

const buildFile = () =>
  new File(['abc'], 'note.pdf', { type: 'application/pdf' });

describe('useFrontComponentFileUpload', () => {
  it('should initiate and complete the upload with the application token and send the bytes without credentials', async () => {
    const store = createStore();

    store.set(tokenPairAtom, buildTokenPair(APPLICATION_ACCESS_TOKEN));
    queueFetchResponses(
      { payload: createFileUploadPayload },
      { status: 204 },
      { payload: completeFileUploadPayload },
    );

    const { result } = renderUseFrontComponentFileUpload(store);

    const uploadedFile = await result.current.uploadFileToFilesField(
      buildFile(),
      { fieldMetadataId: FIELD_METADATA_ID },
    );

    const [createCall, putCall, completeCall] = getFetchCalls();

    expect(createCall[0]).toMatch(/\/metadata$/);
    expect(createCall[1].method).toBe('POST');
    expect(createCall[1].credentials).toBe('omit');
    expect(getRequestHeaders(createCall[1]).Authorization).toBe(
      `Bearer ${APPLICATION_ACCESS_TOKEN}`,
    );
    expect(getRequestVariables(createCall[1])).toEqual({
      filename: 'note.pdf',
      size: 3,
      fileFolder: 'FilesField',
      fieldMetadataId: FIELD_METADATA_ID,
    });

    expect(putCall[0]).toBe(UPLOAD_URL);
    expect(putCall[1].method).toBe('PUT');
    expect(putCall[1].credentials).toBe('omit');
    expect(getRequestHeaders(putCall[1])).toEqual({
      'Content-Type': 'application/octet-stream',
    });
    expect(putCall[1].body).toBeInstanceOf(File);

    expect(completeCall[0]).toMatch(/\/metadata$/);
    expect(completeCall[1].credentials).toBe('omit');
    expect(getRequestHeaders(completeCall[1]).Authorization).toBe(
      `Bearer ${APPLICATION_ACCESS_TOKEN}`,
    );
    expect(getRequestVariables(completeCall[1])).toEqual({ fileId: 'file-1' });

    expect(uploadedFile).toEqual(completedFile);
  });

  it('should surface a refused upload target without sending any bytes', async () => {
    const store = createStore();

    store.set(tokenPairAtom, buildTokenPair(APPLICATION_ACCESS_TOKEN));
    queueFetchResponses({ payload: forbiddenPayload });

    const { result } = renderUseFrontComponentFileUpload(store);

    await expect(
      result.current.uploadFileToFilesField(buildFile(), {
        fieldMetadataId: FIELD_METADATA_ID,
      }),
    ).rejects.toThrow('User does not have permission.');

    expect(getFetchCalls()).toHaveLength(1);
  });

  it.each([
    {
      label: 'the metadata endpoint cannot be reached',
      response: { isNetworkError: true },
    },
    {
      label: 'the metadata endpoint answers with a server error',
      response: { status: 502, payload: null },
    },
  ])('should retry the request once when $label', async ({ response }) => {
    const store = createStore();

    store.set(tokenPairAtom, buildTokenPair(APPLICATION_ACCESS_TOKEN));
    queueFetchResponses(
      response,
      { payload: createFileUploadPayload },
      { status: 204 },
      { payload: completeFileUploadPayload },
    );

    const { result } = renderUseFrontComponentFileUpload(store);

    await expect(
      result.current.uploadFileToFilesField(buildFile(), {
        fieldMetadataId: FIELD_METADATA_ID,
      }),
    ).resolves.toEqual(completedFile);

    expect(getFetchCalls()).toHaveLength(4);
  });

  it('should keep the server error code of a refused upload target', async () => {
    const store = createStore();

    store.set(tokenPairAtom, buildTokenPair(APPLICATION_ACCESS_TOKEN));
    queueFetchResponses({ payload: forbiddenPayload });

    const { result } = renderUseFrontComponentFileUpload(store);

    await expect(
      result.current.uploadFileToFilesField(buildFile(), {
        fieldMetadataId: FIELD_METADATA_ID,
      }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('should refuse to upload before the application token pair is loaded', async () => {
    const store = createStore();

    queueFetchResponses();

    const { result } = renderUseFrontComponentFileUpload(store);

    await expect(
      result.current.uploadFileToFilesField(buildFile(), {
        fieldMetadataId: FIELD_METADATA_ID,
      }),
    ).rejects.toThrow(
      'Application token pair must be initialized before uploading a file',
    );

    expect(getFetchCalls()).toHaveLength(0);
  });
});
