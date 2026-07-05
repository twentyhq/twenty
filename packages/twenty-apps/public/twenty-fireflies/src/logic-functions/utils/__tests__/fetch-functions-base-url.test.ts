import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchFunctionsBaseUrl } from 'src/logic-functions/utils/fetch-functions-base-url';

const getMock = vi.hoisted(() => vi.fn());
const queryMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/rest', () => ({
  RestApiClient: vi.fn(function RestApiClient() {
    return { get: getMock };
  }),
}));

vi.mock('twenty-client-sdk/metadata', () => ({
  MetadataApiClient: vi.fn(function MetadataApiClient() {
    return { query: queryMock };
  }),
}));

describe('fetchFunctionsBaseUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getMock.mockResolvedValue({
      publicFunctionDomain: 'functions.example.com',
    });
    queryMock.mockResolvedValue({ currentWorkspace: { subdomain: 'acme' } });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns the injected functions url without any lookup', async () => {
    vi.stubEnv('TWENTY_FUNCTIONS_URL', 'https://acme.functions.example.com');

    await expect(fetchFunctionsBaseUrl()).resolves.toBe(
      'https://acme.functions.example.com',
    );
    expect(getMock).not.toHaveBeenCalled();
    expect(queryMock).not.toHaveBeenCalled();
  });

  it('builds the isolated origin from the public function domain and subdomain', async () => {
    await expect(fetchFunctionsBaseUrl()).resolves.toBe(
      'https://acme.functions.example.com',
    );
    expect(getMock).toHaveBeenCalledWith('/client-config');
    expect(queryMock).toHaveBeenCalledWith({
      currentWorkspace: { subdomain: true },
    });
  });

  it('returns undefined when the deployment has no public function domain', async () => {
    getMock.mockResolvedValue({ publicFunctionDomain: null });

    await expect(fetchFunctionsBaseUrl()).resolves.toBeUndefined();
    expect(queryMock).not.toHaveBeenCalled();
  });

  it('returns undefined when the workspace subdomain is unavailable', async () => {
    queryMock.mockResolvedValue({ currentWorkspace: { subdomain: '' } });

    await expect(fetchFunctionsBaseUrl()).resolves.toBeUndefined();
  });

  it('returns undefined when resolution fails', async () => {
    getMock.mockRejectedValue(new Error('client config unavailable'));

    await expect(fetchFunctionsBaseUrl()).resolves.toBeUndefined();
  });
});
