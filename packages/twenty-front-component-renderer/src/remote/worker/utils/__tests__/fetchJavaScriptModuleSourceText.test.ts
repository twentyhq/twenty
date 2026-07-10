import { fetchJavaScriptModuleSourceText } from '../fetchJavaScriptModuleSourceText';

const originalFetch = globalThis.fetch;

describe('fetchJavaScriptModuleSourceText', () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('should return the response text when the response is ok', async () => {
    globalThis.fetch = jest.fn(async () => ({
      ok: true,
      text: async () => 'module source',
    })) as unknown as typeof fetch;

    await expect(
      fetchJavaScriptModuleSourceText('https://api.twenty.test/component.js'),
    ).resolves.toBe('module source');
  });

  it('should forward headers to fetch', async () => {
    const fetchSpy = jest.fn(async () => ({
      ok: true,
      text: async () => '',
    }));
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    await fetchJavaScriptModuleSourceText(
      'https://api.twenty.test/component.js',
      {
        Authorization: 'Bearer token',
      },
    );

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.twenty.test/component.js',
      { headers: { Authorization: 'Bearer token' } },
    );
  });

  it('should reject with a coded error when the response is not ok', async () => {
    globalThis.fetch = jest.fn(async () => ({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    })) as unknown as typeof fetch;

    await expect(
      fetchJavaScriptModuleSourceText('https://api.twenty.test/component.js'),
    ).rejects.toMatchObject({ code: 'FRONT_COMPONENT_MODULE_FETCH_FAILED' });
  });

  it('should wrap fetch rejections in a coded error', async () => {
    globalThis.fetch = jest.fn(async () => {
      throw new TypeError('Failed to fetch');
    }) as unknown as typeof fetch;

    await expect(
      fetchJavaScriptModuleSourceText('https://api.twenty.test/component.js'),
    ).rejects.toMatchObject({
      code: 'FRONT_COMPONENT_MODULE_FETCH_FAILED',
      message:
        'Failed to fetch front component module https://api.twenty.test/component.js: Failed to fetch',
    });
  });

  it('should include the url and status in the error message', async () => {
    globalThis.fetch = jest.fn(async () => ({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
    })) as unknown as typeof fetch;

    await expect(
      fetchJavaScriptModuleSourceText('https://api.twenty.test/component.js'),
    ).rejects.toThrow(
      'Failed to fetch front component module https://api.twenty.test/component.js: 403 Forbidden',
    );
  });
});
