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

    const result = await client.get('/rest/companies');

    expect(result).toEqual({ id: '42' });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, requestInit] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.twenty.test/rest/companies');
    expect((requestInit.headers as Headers).get('Authorization')).toBe(
      'Bearer app-access-token',
    );
    expect(requestInit.method).toBe('GET');
  });

  it('should serialize a JSON body and set the content type on post', async () => {
    const fetchMock = vi.fn().mockResolvedValue(buildResponse('{}'));

    const client = new RestApiClient({ fetch: fetchMock });

    await client.post('/rest/companies', { name: 'Twenty' });

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

    await client.get('/rest/companies', {
      query: { limit: 10, search: undefined, includeArchived: false },
    });

    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe(
      'https://api.twenty.test/rest/companies?limit=10&includeArchived=false',
    );
  });

  it('should throw a RestApiClientError when the api url is missing', async () => {
    (globalThis as Record<string, unknown>).process = { env: {} };
    const fetchMock = vi.fn();

    const client = new RestApiClient({ fetch: fetchMock });

    await expect(client.get('/rest/companies')).rejects.toBeInstanceOf(
      RestApiClientError,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('should act as the application when asked to', async () => {
    (globalThis as Record<string, unknown>).process = {
      env: {
        TWENTY_API_URL: 'https://api.twenty.test',
        TWENTY_APP_ACCESS_TOKEN: 'delegated-token',
        TWENTY_APP_APPLICATION_ACCESS_TOKEN: 'application-token',
      },
    };
    const fetchMock = vi.fn().mockResolvedValue(buildResponse('{}'));

    await new RestApiClient({ fetch: fetchMock, runAs: 'application' }).get(
      '/rest/people',
    );

    expect(
      (fetchMock.mock.calls[0][1].headers as Headers).get('Authorization'),
    ).toBe('Bearer application-token');
  });

  it('should act as the triggering person by default', async () => {
    (globalThis as Record<string, unknown>).process = {
      env: {
        TWENTY_API_URL: 'https://api.twenty.test',
        TWENTY_APP_ACCESS_TOKEN: 'delegated-token',
        TWENTY_APP_APPLICATION_ACCESS_TOKEN: 'application-token',
      },
    };
    const fetchMock = vi.fn().mockResolvedValue(buildResponse('{}'));

    await new RestApiClient({ fetch: fetchMock }).get('/rest/people');

    expect(
      (fetchMock.mock.calls[0][1].headers as Headers).get('Authorization'),
    ).toBe('Bearer delegated-token');
  });

  it('should name the application token when it is the one missing', async () => {
    (globalThis as Record<string, unknown>).process = {
      env: { TWENTY_API_URL: 'https://api.twenty.test' },
    };

    await expect(
      new RestApiClient({
        fetch: vi.fn(),
        runAs: 'application',
      }).get('/rest/people'),
    ).rejects.toThrow(/TWENTY_APP_APPLICATION_ACCESS_TOKEN/);
  });

  it('should throw a RestApiClientError when the access token is missing', async () => {
    (globalThis as Record<string, unknown>).process = {
      env: { TWENTY_API_URL: 'https://api.twenty.test' },
    };
    const fetchMock = vi.fn();

    const client = new RestApiClient({ fetch: fetchMock });

    await expect(client.get('/rest/companies')).rejects.toBeInstanceOf(
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

    await expect(client.get('/rest/companies')).rejects.toMatchObject({
      status: 404,
      body: { message: 'Not found' },
    });
  });

  describe('app route paths', () => {
    it('should strip the /s prefix and send app route paths to an isolated-domain functions url at the root', async () => {
      (globalThis as Record<string, unknown>).process = {
        env: {
          TWENTY_API_URL: 'https://api.twenty.test',
          TWENTY_FUNCTIONS_URL: 'https://acme.functions.twenty.test',
          TWENTY_APP_ACCESS_TOKEN: 'app-access-token',
        },
      };
      const fetchMock = vi.fn().mockResolvedValue(buildResponse('{}'));

      const client = new RestApiClient({ fetch: fetchMock });

      await client.post('/s/my-app/my-route', { remainingIds: ['a'] });

      const [url, requestInit] = fetchMock.mock.calls[0];
      expect(url).toBe('https://acme.functions.twenty.test/my-app/my-route');
      expect(requestInit.method).toBe('POST');
    });

    it('should join a same-site functions url that already contains /s without doubling slashes', async () => {
      (globalThis as Record<string, unknown>).process = {
        env: {
          TWENTY_API_URL: 'https://api.twenty.test',
          TWENTY_FUNCTIONS_URL: 'https://api.twenty.test/s/',
          TWENTY_APP_ACCESS_TOKEN: 'app-access-token',
        },
      };
      const fetchMock = vi.fn().mockResolvedValue(buildResponse('{}'));

      const client = new RestApiClient({ fetch: fetchMock });

      await client.post('/s/my-app/my-route');

      const [url] = fetchMock.mock.calls[0];
      expect(url).toBe('https://api.twenty.test/s/my-app/my-route');
    });

    it('should fall back to the api url /s route when the functions url is not injected', async () => {
      const fetchMock = vi.fn().mockResolvedValue(buildResponse('{}'));

      const client = new RestApiClient({ fetch: fetchMock });

      await client.post('/s/my-app/my-route');

      const [url] = fetchMock.mock.calls[0];
      expect(url).toBe('https://api.twenty.test/s/my-app/my-route');
    });

    it('should treat an empty functions url as not injected', async () => {
      (globalThis as Record<string, unknown>).process = {
        env: {
          TWENTY_API_URL: 'https://api.twenty.test',
          TWENTY_FUNCTIONS_URL: '',
          TWENTY_APP_ACCESS_TOKEN: 'app-access-token',
        },
      };
      const fetchMock = vi.fn().mockResolvedValue(buildResponse('{}'));

      const client = new RestApiClient({ fetch: fetchMock });

      await client.post('/s/my-app/my-route');

      const [url] = fetchMock.mock.calls[0];
      expect(url).toBe('https://api.twenty.test/s/my-app/my-route');
    });

    it('should keep rest paths on the api url when a functions url is injected', async () => {
      (globalThis as Record<string, unknown>).process = {
        env: {
          TWENTY_API_URL: 'https://api.twenty.test',
          TWENTY_FUNCTIONS_URL: 'https://acme.functions.twenty.test',
          TWENTY_APP_ACCESS_TOKEN: 'app-access-token',
        },
      };
      const fetchMock = vi.fn().mockResolvedValue(buildResponse('{}'));

      const client = new RestApiClient({ fetch: fetchMock });

      await client.get('/rest/companies');

      const [url] = fetchMock.mock.calls[0];
      expect(url).toBe('https://api.twenty.test/rest/companies');
    });

    it('should keep unprefixed paths on the api url when a functions url is injected', async () => {
      (globalThis as Record<string, unknown>).process = {
        env: {
          TWENTY_API_URL: 'https://api.twenty.test',
          TWENTY_FUNCTIONS_URL: 'https://acme.functions.twenty.test',
          TWENTY_APP_ACCESS_TOKEN: 'app-access-token',
        },
      };
      const fetchMock = vi.fn().mockResolvedValue(buildResponse('{}'));

      const client = new RestApiClient({ fetch: fetchMock });

      await client.post('/my-app/my-route');

      const [url] = fetchMock.mock.calls[0];
      expect(url).toBe('https://api.twenty.test/my-app/my-route');
    });

    it('should prefer an explicit baseUrl over the functions url and keep the path untouched', async () => {
      (globalThis as Record<string, unknown>).process = {
        env: {
          TWENTY_API_URL: 'https://api.twenty.test',
          TWENTY_FUNCTIONS_URL: 'https://acme.functions.twenty.test',
          TWENTY_APP_ACCESS_TOKEN: 'app-access-token',
        },
      };
      const fetchMock = vi.fn().mockResolvedValue(buildResponse('{}'));

      const client = new RestApiClient({
        baseUrl: 'https://explicit.twenty.test',
        fetch: fetchMock,
      });

      await client.post('/s/my-app/my-route');

      const [url] = fetchMock.mock.calls[0];
      expect(url).toBe('https://explicit.twenty.test/s/my-app/my-route');
    });

    it('should resolve an app route url without sending a request', () => {
      (globalThis as Record<string, unknown>).process = {
        env: {
          TWENTY_API_URL: 'https://api.twenty.test',
          TWENTY_FUNCTIONS_URL: 'https://acme.functions.twenty.test',
          TWENTY_APP_ACCESS_TOKEN: 'app-access-token',
        },
      };
      const fetchMock = vi.fn();

      const client = new RestApiClient({ fetch: fetchMock });

      const url = client.resolveUrl('/s/documents/view', {
        query: { id: 'record-1' },
      });

      expect(url).toBe(
        'https://acme.functions.twenty.test/documents/view?id=record-1',
      );
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('should resolve a rest url on the api base without sending a request', () => {
      const fetchMock = vi.fn();

      const client = new RestApiClient({ fetch: fetchMock });

      const url = client.resolveUrl('/rest/companies');

      expect(url).toBe('https://api.twenty.test/rest/companies');
      expect(fetchMock).not.toHaveBeenCalled();
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

    const result = await client.get('/rest/companies');

    expect(result).toEqual({ ok: true });
    expect(requestAccessTokenRefresh).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(
      (fetchMock.mock.calls[1][1].headers as Headers).get('Authorization'),
    ).toBe('Bearer refreshed-token');
  });

  describe('acting as a workspace member', () => {
    const WORKSPACE_MEMBER_ID = '20202020-0687-4c41-b707-ed1bfca972a7';

    beforeEach(() => {
      (globalThis as Record<string, unknown>).process = {
        env: {
          TWENTY_API_URL: 'https://api.twenty.test',
          TWENTY_APP_ACCESS_TOKEN: 'delegated-token',
          TWENTY_APP_APPLICATION_ACCESS_TOKEN: 'application-token',
        },
      };
    });

    const buildExchangeFetchMock = (exchangeBody: unknown) =>
      vi
        .fn()
        .mockImplementation(async (url: string) =>
          url.endsWith('/metadata')
            ? buildResponse(JSON.stringify(exchangeBody))
            : buildResponse('{}'),
        );

    it('should exchange the application token for the member, then reuse it', async () => {
      const fetchMock = buildExchangeFetchMock({
        data: {
          generateApplicationTokenForWorkspaceMember: {
            applicationAccessToken: { token: 'member-token' },
          },
        },
      });

      const client = new RestApiClient({
        fetch: fetchMock,
        runAs: { workspaceMemberId: WORKSPACE_MEMBER_ID },
      });

      await client.get('/rest/people');
      await client.get('/rest/companies');

      expect(fetchMock).toHaveBeenCalledTimes(3);

      const [exchangeUrl, exchangeInit] = fetchMock.mock.calls[0];
      expect(exchangeUrl).toBe('https://api.twenty.test/metadata');
      expect(new Headers(exchangeInit.headers).get('Authorization')).toBe(
        'Bearer application-token',
      );
      expect(JSON.parse(exchangeInit.body)).toMatchObject({
        variables: { workspaceMemberId: WORKSPACE_MEMBER_ID },
      });

      expect(
        (fetchMock.mock.calls[1][1].headers as Headers).get('Authorization'),
      ).toBe('Bearer member-token');
      expect(
        (fetchMock.mock.calls[2][1].headers as Headers).get('Authorization'),
      ).toBe('Bearer member-token');
    });

    it('should surface the refusal when the server will not act as the member', async () => {
      const fetchMock = buildExchangeFetchMock({
        errors: [{ message: 'Workspace member not found' }],
      });

      await expect(
        new RestApiClient({
          fetch: fetchMock,
          runAs: { workspaceMemberId: WORKSPACE_MEMBER_ID },
        }).get('/rest/people'),
      ).rejects.toThrow(/Workspace member not found/);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('should name the application token when acting as a member outside a run', async () => {
      (globalThis as Record<string, unknown>).process = {
        env: { TWENTY_API_URL: 'https://api.twenty.test' },
      };
      const fetchMock = vi.fn();

      await expect(
        new RestApiClient({
          fetch: fetchMock,
          runAs: { workspaceMemberId: WORKSPACE_MEMBER_ID },
        }).get('/rest/people'),
      ).rejects.toThrow(/TWENTY_APP_APPLICATION_ACCESS_TOKEN/);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('should let a default Authorization header win over the member', async () => {
      const fetchMock = vi.fn().mockResolvedValue(buildResponse('{}'));

      await new RestApiClient({
        fetch: fetchMock,
        defaultHeaders: { Authorization: 'Bearer default-header-token' },
        runAs: { workspaceMemberId: WORKSPACE_MEMBER_ID },
      }).get('/rest/people');

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(
        (fetchMock.mock.calls[0][1].headers as Headers).get('Authorization'),
      ).toBe('Bearer default-header-token');
    });

    it('should let a per-request Authorization header win over the member', async () => {
      const fetchMock = vi.fn().mockResolvedValue(buildResponse('{}'));

      await new RestApiClient({
        fetch: fetchMock,
        runAs: { workspaceMemberId: WORKSPACE_MEMBER_ID },
      }).get('/rest/people', {
        headers: { Authorization: 'Bearer request-header-token' },
      });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(
        (fetchMock.mock.calls[0][1].headers as Headers).get('Authorization'),
      ).toBe('Bearer request-header-token');
    });

    it('should let an explicit token win over the member', async () => {
      const fetchMock = vi.fn().mockResolvedValue(buildResponse('{}'));

      await new RestApiClient({
        fetch: fetchMock,
        token: 'explicit-token',
        runAs: { workspaceMemberId: WORKSPACE_MEMBER_ID },
      }).get('/rest/people');

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(
        (fetchMock.mock.calls[0][1].headers as Headers).get('Authorization'),
      ).toBe('Bearer explicit-token');
    });
  });
});
