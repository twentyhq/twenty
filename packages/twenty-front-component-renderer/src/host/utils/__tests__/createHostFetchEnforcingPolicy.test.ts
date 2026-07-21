import { CustomError } from 'twenty-shared/utils';

import { createHostFetchEnforcingPolicy } from '../createHostFetchEnforcingPolicy';

const originalFetch = globalThis.fetch;

const createFakeResponse = () => ({
  ok: true,
  status: 200,
  statusText: 'OK',
  headers: new Map([['content-type', 'application/json']]),
  text: async () => 'response-body',
});

describe('createHostFetchEnforcingPolicy', () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('should reject requests to origins that are not allowlisted', async () => {
    const fetchSpy = jest.fn(async () => createFakeResponse());
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    const hostFetch = createHostFetchEnforcingPolicy({
      allowedOrigins: ['https://api.twenty.test'],
      fileStorageRedirectableUrls: [],
    });

    await expect(hostFetch({ url: 'https://evil.test/steal' })).rejects.toThrow(
      'disallowed origin',
    );
    await expect(
      hostFetch({ url: 'https://evil.test/steal' }),
    ).rejects.toMatchObject({
      code: 'FRONT_COMPONENT_HOST_FETCH_BLOCKED_ORIGIN',
    });
    await expect(
      hostFetch({ url: 'https://evil.test/steal' }),
    ).rejects.toBeInstanceOf(CustomError);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('should uppercase lowercase methods and default to GET', async () => {
    const fetchSpy = jest.fn(async () => createFakeResponse());
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    const hostFetch = createHostFetchEnforcingPolicy({
      allowedOrigins: ['https://api.twenty.test'],
      fileStorageRedirectableUrls: [],
    });
    await hostFetch({ url: 'https://api.twenty.test/graphql', method: 'post' });
    await hostFetch({ url: 'https://api.twenty.test/graphql' });

    expect(fetchSpy).toHaveBeenNthCalledWith(
      1,
      'https://api.twenty.test/graphql',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(fetchSpy).toHaveBeenNthCalledWith(
      2,
      'https://api.twenty.test/graphql',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('should forward allowlisted requests without ambient credentials', async () => {
    const fetchSpy = jest.fn(async () => createFakeResponse());
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    const hostFetch = createHostFetchEnforcingPolicy({
      allowedOrigins: ['https://api.twenty.test'],
      fileStorageRedirectableUrls: [],
    });
    const result = await hostFetch({
      url: 'https://api.twenty.test/graphql',
      method: 'POST',
      headers: { authorization: 'Bearer token' },
      body: '{"query":"{ me }"}',
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.twenty.test/graphql',
      expect.objectContaining({ method: 'POST', credentials: 'omit' }),
    );
    expect(result.status).toBe(200);
    expect(result.body).toBe('response-body');
    expect(result.headers['content-type']).toBe('application/json');
  });

  it('should refuse redirects by default', async () => {
    const fetchSpy = jest.fn(async () => createFakeResponse());
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    const hostFetch = createHostFetchEnforcingPolicy({
      allowedOrigins: ['https://api.twenty.test'],
      fileStorageRedirectableUrls: [],
    });
    await hostFetch({
      url: 'https://api.twenty.test/graphql',
      method: 'POST',
    });
    await hostFetch({
      url: 'https://api.twenty.test/rest/some-endpoint',
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.twenty.test/graphql',
      expect.objectContaining({ redirect: 'error' }),
    );
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.twenty.test/rest/some-endpoint',
      expect.objectContaining({ redirect: 'error' }),
    );
  });

  it('should follow file storage redirects only for GET requests to redirectable urls', async () => {
    const fetchSpy = jest.fn(async () => createFakeResponse());
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    const componentUrl =
      'https://api.twenty.test/rest/front-components/component-id';

    const hostFetch = createHostFetchEnforcingPolicy({
      allowedOrigins: ['https://api.twenty.test'],
      fileStorageRedirectableUrls: [componentUrl],
    });
    await hostFetch({ url: componentUrl });
    await hostFetch({ url: componentUrl, method: 'HEAD' });
    await hostFetch({ url: componentUrl, method: 'POST' });

    expect(fetchSpy).toHaveBeenCalledWith(
      componentUrl,
      expect.objectContaining({ method: 'GET', redirect: 'follow' }),
    );
    expect(fetchSpy).toHaveBeenCalledWith(
      componentUrl,
      expect.objectContaining({ method: 'HEAD', redirect: 'follow' }),
    );
    expect(fetchSpy).toHaveBeenCalledWith(
      componentUrl,
      expect.objectContaining({ method: 'POST', redirect: 'error' }),
    );
  });

  it('should reject malformed request urls', async () => {
    const hostFetch = createHostFetchEnforcingPolicy({
      allowedOrigins: ['https://api.twenty.test'],
      fileStorageRedirectableUrls: [],
    });

    await expect(hostFetch({ url: 'not a url' })).rejects.toThrow(
      'disallowed origin',
    );
  });
});
