import type { Mock } from 'vitest';

type MockResponseConfig = {
  body?: string;
  status?: number;
  headers?: HeadersInit;
  statusText?: string;
};

type MockResponseFactory = (
  input?: RequestInfo | URL,
  init?: RequestInit,
) => MockResponseConfig | string | Promise<MockResponseConfig | string>;

type MockRejectFactory = () => unknown | Promise<unknown>;

if (typeof vi === 'undefined' || typeof vi.fn !== 'function') {
  throw new Error('fetchMock requires a test runtime with fn() support.');
}

type FetchFn = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

type FetchMock = Mock<FetchFn> & {
  mockResponse: (factory: MockResponseFactory) => FetchMock;
  mockReject: (factory: MockRejectFactory) => FetchMock;
};

const fetchMock: FetchMock = Object.assign(vi.fn<FetchFn>(), {
  mockResponse: (factory: MockResponseFactory) => {
    fetchMock.mockImplementation(async (input, init) => {
      const payload = await factory(input, init);
      return buildResponse(payload);
    });
    return fetchMock;
  },
  mockReject: (factory: MockRejectFactory) => {
    fetchMock.mockImplementation(async () => {
      const error = await factory();
      return Promise.reject(error);
    });
    return fetchMock;
  },
});

const buildResponse = (payload: MockResponseConfig | string) => {
  if (typeof payload === 'string') {
    return new Response(payload);
  }

  return new Response(payload.body ?? '', {
    status: payload.status,
    headers: payload.headers,
    statusText: payload.statusText,
  });
};

export const enableFetchMocks = () => {
  if (typeof vi.stubGlobal === 'function') {
    vi.stubGlobal('fetch', fetchMock);
  } else {
    globalThis.fetch = fetchMock;
  }

  return fetchMock;
};

export default fetchMock;
