import { fetchJavaScriptModuleSourceText } from '@/host/utils/fetchJavaScriptModuleSourceText';

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
      fetchJavaScriptModuleSourceText('https://api.twenty.test/core/abc.js'),
    ).resolves.toBe('module source');
  });

  it('should forward headers and omit credentials', async () => {
    const fetchSpy = jest.fn(async () => ({
      ok: true,
      text: async () => '',
    }));
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    await fetchJavaScriptModuleSourceText(
      'https://api.twenty.test/core/abc.js',
      { Authorization: 'Bearer token' },
    );

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.twenty.test/core/abc.js',
      { headers: { Authorization: 'Bearer token' }, credentials: 'omit' },
    );
  });

  it('should reject with a coded error when the response is not ok', async () => {
    globalThis.fetch = jest.fn(async () => ({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    })) as unknown as typeof fetch;

    await expect(
      fetchJavaScriptModuleSourceText('https://api.twenty.test/core/abc.js'),
    ).rejects.toMatchObject({ code: 'FRONT_COMPONENT_MODULE_FETCH_FAILED' });
  });

  it('should wrap fetch rejections in a coded error', async () => {
    globalThis.fetch = jest.fn(async () => {
      throw new TypeError('Failed to fetch');
    }) as unknown as typeof fetch;

    await expect(
      fetchJavaScriptModuleSourceText('https://api.twenty.test/core/abc.js'),
    ).rejects.toMatchObject({
      code: 'FRONT_COMPONENT_MODULE_FETCH_FAILED',
      message:
        'Failed to fetch SDK client module https://api.twenty.test/core/abc.js: Failed to fetch',
    });
  });
});
