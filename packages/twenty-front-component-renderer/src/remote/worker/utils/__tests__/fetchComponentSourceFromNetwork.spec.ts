import { fetchComponentSourceFromNetwork } from '@/remote/worker/utils/fetchComponentSourceFromNetwork';

const COMPONENT_URL =
  'https://api.twenty.com/rest/front-components/component-id/checksum-abc.js';
const PRESIGNED_URL = 'https://s3.example.com/component.js?signed=abc';

type FakeResponseInit = {
  ok?: boolean;
  status?: number;
  statusText?: string;
  contentType?: string;
  body?: string;
  json?: unknown;
};

const createFakeResponse = ({
  ok = true,
  status = 200,
  statusText = 'OK',
  contentType = 'application/javascript',
  body = '',
  json,
}: FakeResponseInit) => ({
  ok,
  status,
  statusText,
  headers: {
    get: (name: string) => (name === 'content-type' ? contentType : null),
  },
  text: jest.fn(async () => body),
  json: jest.fn(async () => json),
});

describe('fetchComponentSourceFromNetwork', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('returns the raw body and forwards headers for a direct JS response', async () => {
    const fetchMock = jest.fn(async () =>
      createFakeResponse({ body: 'export default () => {};' }),
    );

    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const source = await fetchComponentSourceFromNetwork({
      url: COMPONENT_URL,
      headers: { Authorization: 'Bearer token' },
    });

    expect(source).toBe('export default () => {};');
    expect(fetchMock).toHaveBeenCalledWith(COMPONENT_URL, {
      headers: { Authorization: 'Bearer token' },
    });
  });

  it('follows the JSON handoff and fetches the presigned URL header-less', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(
        createFakeResponse({
          contentType: 'application/json',
          json: { url: PRESIGNED_URL },
        }),
      )
      .mockResolvedValueOnce(
        createFakeResponse({ body: 'presigned bundle source' }),
      );

    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const source = await fetchComponentSourceFromNetwork({
      url: COMPONENT_URL,
      headers: { Authorization: 'Bearer token' },
    });

    expect(source).toBe('presigned bundle source');
    expect(fetchMock).toHaveBeenNthCalledWith(1, COMPONENT_URL, {
      headers: { Authorization: 'Bearer token' },
    });
    expect(fetchMock).toHaveBeenNthCalledWith(2, PRESIGNED_URL);
  });

  it('throws when the initial response is not ok', async () => {
    const fetchMock = jest.fn(async () =>
      createFakeResponse({ ok: false, status: 404, statusText: 'Not Found' }),
    );

    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(
      fetchComponentSourceFromNetwork({ url: COMPONENT_URL }),
    ).rejects.toThrow(`Failed to fetch ${COMPONENT_URL}: 404 Not Found`);
  });

  it('throws when the JSON handoff payload is invalid', async () => {
    const fetchMock = jest.fn(async () =>
      createFakeResponse({
        contentType: 'application/json',
        json: { notUrl: 'nope' },
      }),
    );

    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(
      fetchComponentSourceFromNetwork({ url: COMPONENT_URL }),
    ).rejects.toThrow(
      `Invalid component source handoff response from ${COMPONENT_URL}`,
    );
  });

  it('throws when the presigned response is not ok', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(
        createFakeResponse({
          contentType: 'application/json',
          json: { url: PRESIGNED_URL },
        }),
      )
      .mockResolvedValueOnce(
        createFakeResponse({ ok: false, status: 403, statusText: 'Forbidden' }),
      );

    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(
      fetchComponentSourceFromNetwork({ url: COMPONENT_URL }),
    ).rejects.toThrow('Failed to fetch presigned URL: 403 Forbidden');
  });
});
