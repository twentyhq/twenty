import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { resolveOwnRouteTarget } from 'src/logic-functions/data/resolve-own-route-target.util';

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

describe('resolveOwnRouteTarget', () => {
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

  it('uses the injected functions url without any lookup', async () => {
    vi.stubEnv('TWENTY_FUNCTIONS_URL', 'https://acme.functions.example.com');

    await expect(resolveOwnRouteTarget()).resolves.toEqual({
      baseUrl: 'https://acme.functions.example.com',
      pathPrefix: '',
    });
    expect(getMock).not.toHaveBeenCalled();
    expect(queryMock).not.toHaveBeenCalled();
  });

  it('builds the isolated functions origin from public function domain and subdomain', async () => {
    await expect(resolveOwnRouteTarget()).resolves.toEqual({
      baseUrl: 'https://acme.functions.example.com',
      pathPrefix: '',
    });
    expect(getMock).toHaveBeenCalledWith('/client-config');
    expect(queryMock).toHaveBeenCalledWith({
      currentWorkspace: { subdomain: true },
    });
  });

  it('builds a workspace-aware legacy route target in multi-workspace deployments without a public functions domain', async () => {
    vi.stubEnv('TWENTY_API_URL', 'http://localhost:3000');
    getMock.mockResolvedValue({
      defaultSubdomain: 'app',
      frontDomain: 'localhost',
      isMultiWorkspaceEnabled: true,
      publicFunctionDomain: null,
    });

    await expect(resolveOwnRouteTarget()).resolves.toEqual({
      baseUrl: 'http://acme.localhost:3000',
      pathPrefix: '/s',
    });
  });

  it('falls back to the plain legacy route in single-workspace deployments without a public functions domain', async () => {
    getMock.mockResolvedValue({
      isMultiWorkspaceEnabled: false,
      publicFunctionDomain: null,
    });

    await expect(resolveOwnRouteTarget()).resolves.toEqual({
      pathPrefix: '/s',
    });
    expect(queryMock).not.toHaveBeenCalled();
  });

  it('falls back to the plain legacy route when target resolution fails', async () => {
    getMock.mockRejectedValue(new Error('client config unavailable'));

    await expect(resolveOwnRouteTarget()).resolves.toEqual({
      pathPrefix: '/s',
    });
  });
});
