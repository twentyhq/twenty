import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RestApiClient, RestApiClientError } from '../index';

const buildResponse = (
  body: string,
  init?: { status?: number; statusText?: string },
): Response =>
  new Response(body, {
    status: init?.status ?? 200,
    statusText: init?.statusText ?? 'OK',
  });

describe('RestApiClient', () => {
  const originalProcess = (globalThis as Record<string, unknown>).process;
  const originalCommunicationApi = (globalThis as Record<string, unknown>)
    .frontComponentHostCommunicationApi;

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
    (globalThis as Record<string, unknown>).frontComponentHostCommunicationApi =
      originalCommunicationApi;
    vi.restoreAllMocks();
  });

  it('should call the resolved url with a bearer token and parse the JSON response', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(buildResponse(JSON.stringify({ id: '42' })));

    const client = new RestApiClient({ fetch: fetchMock });

    const result = await client.get('/s/my-app/my-route');

    expect(result).toEqual({ id: '42' });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, requestInit] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.twenty.test/s/my-app/my-route');
    expect((requestInit.headers as Headers).get('Authorization')).toBe(
      'Bearer app-access-token',
    );
    expect(requestInit.method).toBe('GET');
  });

  it('should serialize a JSON body and set the content type on post', async () => {
    const fetchMock = vi.fn().mockResolvedValue(buildResponse('{}'));

    const client = new RestApiClient({ fetch: fetchMock });

    await client.post('/s/my-app/my-route', { name: 'Twenty' });

    const [, requestInit] = fetchMock.mock.calls[0];
    expect(requestInit.method).toBe('POST');
    expect((requestInit.headers as Headers).get('Content-Type')).toBe(
      'application/json',
    );
    expect(requestInit.body).toBe(JSON.stringify({ name: 'Twenty' }));
  });

  it('should append query parameters while skipping nullish values', async () => {
    const fetchMock = vi.fn().mockResolvedValue(buildResponse('{}'));

    const client = new RestApiClient({ fetch: fetchMock });

    await client.get('/s/my-app/my-route', {
      query: { limit: 10, search: undefined, includeArchived: false },
    });

    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe(
      'https://api.twenty.test/s/my-app/my-route?limit=10&includeArchived=false',
    );
  });

  it('should throw a RestApiClientError when the api url is missing', async () => {
    (globalThis as Record<string, unknown>).process = { env: {} };
    const fetchMock = vi.fn();

    const client = new RestApiClient({ fetch: fetchMock });

    await expect(client.get('/s/my-app/my-route')).rejects.toBeInstanceOf(
      RestApiClientError,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('should throw a RestApiClientError when the access token is missing', async () => {
    (globalThis as Record<string, unknown>).process = {
      env: { TWENTY_API_URL: 'https://api.twenty.test' },
    };
    const fetchMock = vi.fn();

    const client = new RestApiClient({ fetch: fetchMock });

    await expect(client.get('/s/my-app/my-route')).rejects.toBeInstanceOf(
      RestApiClientError,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('should surface non-2xx responses as a RestApiClientError carrying the parsed body', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      buildResponse(JSON.stringify({ message: 'Not found' }), {
        status: 404,
        statusText: 'Not Found',
      }),
    );

    const client = new RestApiClient({ fetch: fetchMock });

    await expect(client.get('/s/my-app/my-route')).rejects.toMatchObject({
      status: 404,
      body: { message: 'Not found' },
    });
  });

  it('should refresh the access token once on a 401 and retry the request', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(buildResponse('', { status: 401 }))
      .mockResolvedValueOnce(buildResponse(JSON.stringify({ ok: true })));

    const requestAccessTokenRefresh = vi
      .fn()
      .mockResolvedValue('refreshed-token');

    (globalThis as Record<string, unknown>).frontComponentHostCommunicationApi =
      { requestAccessTokenRefresh };

    const client = new RestApiClient({ fetch: fetchMock });

    const result = await client.get('/s/my-app/my-route');

    expect(result).toEqual({ ok: true });
    expect(requestAccessTokenRefresh).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(
      (fetchMock.mock.calls[1][1].headers as Headers).get('Authorization'),
    ).toBe('Bearer refreshed-token');
  });
});
