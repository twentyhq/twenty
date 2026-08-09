import { isAuthProxyRedirect } from '@/apollo/utils/isAuthProxyRedirect';

const PROBE_URL = 'http://localhost:3000/graphql';

describe('isAuthProxyRedirect', () => {
  const mockFetch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = mockFetch;
  });

  it('should return true when the proxy answers with an opaque redirect', async () => {
    mockFetch.mockResolvedValue({ type: 'opaqueredirect', status: 0 });

    expect(await isAuthProxyRedirect(PROBE_URL)).toBe(true);
  });

  it('should probe without following redirects so the response stays inspectable', async () => {
    mockFetch.mockResolvedValue({ type: 'opaqueredirect', status: 0 });

    await isAuthProxyRedirect(PROBE_URL);

    expect(mockFetch).toHaveBeenCalledWith(
      PROBE_URL,
      expect.objectContaining({ redirect: 'manual', credentials: 'include' }),
    );
  });

  it('should return false when the server responds normally', async () => {
    mockFetch.mockResolvedValue({ type: 'basic', status: 200 });

    expect(await isAuthProxyRedirect(PROBE_URL)).toBe(false);
  });

  it('should return false when the server responds with an error status', async () => {
    mockFetch.mockResolvedValue({ type: 'basic', status: 500 });

    expect(await isAuthProxyRedirect(PROBE_URL)).toBe(false);
  });

  it('should return false when the network is genuinely unreachable', async () => {
    mockFetch.mockRejectedValue(new TypeError('Failed to fetch'));

    expect(await isAuthProxyRedirect(PROBE_URL)).toBe(false);
  });
});
