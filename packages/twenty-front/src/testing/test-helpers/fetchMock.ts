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

type MockFn = ((...args: unknown[]) => unknown) & {
  mockImplementation: (impl: (...args: any[]) => any) => MockFn;
  mockReset: () => void;
};

type Runtime = {
  fn?: () => MockFn;
  stubGlobal?: (key: string, value: unknown) => void;
};

const runtime = ((globalThis as unknown as { vi?: Runtime; jest?: Runtime })
  .vi ?? (globalThis as unknown as { jest?: Runtime }).jest) as
  | Runtime
  | undefined;

if (!runtime?.fn) {
  throw new Error('fetchMock requires a test runtime with fn() support.');
}

const fetchMock = runtime.fn() as MockFn & {
  mockResponse: (factory: MockResponseFactory) => typeof fetchMock;
  mockReject: (factory: MockRejectFactory) => typeof fetchMock;
  mockReset: () => void;
};

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

fetchMock.mockResponse = (factory: MockResponseFactory) => {
  fetchMock.mockImplementation(
    async (input?: RequestInfo | URL, init?: RequestInit) => {
      const payload = await factory(input, init);
      return buildResponse(payload);
    },
  );
  return fetchMock;
};

fetchMock.mockReject = (factory: MockRejectFactory) => {
  fetchMock.mockImplementation(async () => {
    const error = await factory();
    return Promise.reject(error);
  });
  return fetchMock;
};

fetchMock.mockReset = () => {
  fetchMock.mockImplementation(() => undefined);
};

export const enableFetchMocks = () => {
  if (typeof runtime?.stubGlobal === 'function') {
    runtime.stubGlobal('fetch', fetchMock);
  } else {
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  }

  return fetchMock;
};

export default fetchMock;
