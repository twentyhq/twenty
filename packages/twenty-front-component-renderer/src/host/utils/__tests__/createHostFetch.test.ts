import { createHostFetch } from '../createHostFetch';

const originalFetch = globalThis.fetch;

const createFakeResponse = () => ({
  ok: true,
  status: 200,
  statusText: 'OK',
  headers: new Map([['content-type', 'application/json']]),
  text: async () => 'response-body',
});

describe('createHostFetch', () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('should reject requests to origins that are not allowlisted', async () => {
    const fetchSpy = jest.fn(async () => createFakeResponse());
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    const hostFetch = createHostFetch(['https://api.twenty.test']);

    await expect(hostFetch({ url: 'https://evil.test/steal' })).rejects.toThrow(
      'disallowed origin',
    );
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('should forward allowlisted requests without ambient credentials', async () => {
    const fetchSpy = jest.fn(async () => createFakeResponse());
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    const hostFetch = createHostFetch(['https://api.twenty.test']);
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

  it('should refuse redirects for non-GET requests', async () => {
    const fetchSpy = jest.fn(async () => createFakeResponse());
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    const hostFetch = createHostFetch(['https://api.twenty.test']);
    await hostFetch({
      url: 'https://api.twenty.test/graphql',
      method: 'POST',
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.twenty.test/graphql',
      expect.objectContaining({ redirect: 'error' }),
    );
  });

  it('should follow file storage redirects for GET requests', async () => {
    const fetchSpy = jest.fn(async () => createFakeResponse());
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    const hostFetch = createHostFetch(['https://api.twenty.test']);
    await hostFetch({
      url: 'https://api.twenty.test/rest/front-components/component-id',
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.twenty.test/rest/front-components/component-id',
      expect.objectContaining({ method: 'GET', redirect: 'follow' }),
    );
  });

  it('should reject malformed request urls', async () => {
    const hostFetch = createHostFetch(['https://api.twenty.test']);

    await expect(hostFetch({ url: 'not a url' })).rejects.toThrow(
      'disallowed origin',
    );
  });
});
