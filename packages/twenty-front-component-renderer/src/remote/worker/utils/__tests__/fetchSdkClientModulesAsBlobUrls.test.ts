import { fetchSdkClientModulesAsBlobUrls } from '../fetchSdkClientModulesAsBlobUrls';

const originalFetch = globalThis.fetch;
const originalCreateObjectUrl = URL.createObjectURL;
const originalRevokeObjectUrl = URL.revokeObjectURL;

const sdkClientUrls = {
  core: 'https://api.twenty.test/sdk-client/application-id/core',
  metadata: 'https://api.twenty.test/sdk-client/application-id/metadata',
};

describe('fetchSdkClientModulesAsBlobUrls', () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
    URL.createObjectURL = originalCreateObjectUrl;
    URL.revokeObjectURL = originalRevokeObjectUrl;
  });

  it('should fetch both sdk modules and return their blob urls', async () => {
    const fetchSpy = jest.fn(async (url: string) => ({
      ok: true,
      text: async () => `source of ${url}`,
    }));
    globalThis.fetch = fetchSpy as unknown as typeof fetch;
    URL.createObjectURL = jest
      .fn()
      .mockReturnValueOnce('blob:core-url')
      .mockReturnValueOnce('blob:metadata-url');

    await expect(
      fetchSdkClientModulesAsBlobUrls(sdkClientUrls),
    ).resolves.toEqual({
      core: 'blob:core-url',
      metadata: 'blob:metadata-url',
    });
    expect(fetchSpy).toHaveBeenCalledWith(sdkClientUrls.core, {
      headers: undefined,
    });
    expect(fetchSpy).toHaveBeenCalledWith(sdkClientUrls.metadata, {
      headers: undefined,
    });
  });

  it('should forward headers to both module fetches', async () => {
    const fetchSpy = jest.fn(async () => ({
      ok: true,
      text: async () => '',
    }));
    globalThis.fetch = fetchSpy as unknown as typeof fetch;
    URL.createObjectURL = jest.fn(() => 'blob:mock-url');

    await fetchSdkClientModulesAsBlobUrls(sdkClientUrls, {
      Authorization: 'Bearer token',
    });

    expect(fetchSpy).toHaveBeenCalledWith(sdkClientUrls.core, {
      headers: { Authorization: 'Bearer token' },
    });
    expect(fetchSpy).toHaveBeenCalledWith(sdkClientUrls.metadata, {
      headers: { Authorization: 'Bearer token' },
    });
  });

  it('should propagate the fetch error when one module fails to load', async () => {
    globalThis.fetch = jest.fn(async (url: string) => ({
      ok: url !== sdkClientUrls.metadata,
      status: 500,
      statusText: 'Internal Server Error',
      text: async () => '',
    })) as unknown as typeof fetch;
    URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    URL.revokeObjectURL = jest.fn();

    await expect(
      fetchSdkClientModulesAsBlobUrls(sdkClientUrls),
    ).rejects.toMatchObject({
      code: 'FRONT_COMPONENT_MODULE_FETCH_FAILED',
    });
  });

  it('should revoke the created blob url when the other module fails to load', async () => {
    globalThis.fetch = jest.fn(async (url: string) => ({
      ok: url !== sdkClientUrls.metadata,
      status: 500,
      statusText: 'Internal Server Error',
      text: async () => '',
    })) as unknown as typeof fetch;
    URL.createObjectURL = jest.fn(() => 'blob:core-url');
    const revokeObjectUrlSpy = jest.fn();
    URL.revokeObjectURL = revokeObjectUrlSpy;

    await expect(
      fetchSdkClientModulesAsBlobUrls(sdkClientUrls),
    ).rejects.toMatchObject({
      code: 'FRONT_COMPONENT_MODULE_FETCH_FAILED',
    });
    expect(revokeObjectUrlSpy).toHaveBeenCalledWith('blob:core-url');
  });
});
