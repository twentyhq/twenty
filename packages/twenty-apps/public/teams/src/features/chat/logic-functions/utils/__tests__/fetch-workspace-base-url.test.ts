import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchWorkspaceBaseUrl } from 'src/features/chat/logic-functions/utils/fetch-workspace-base-url';

const queryMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/metadata', () => ({
  MetadataApiClient: vi.fn(function () {
    return { query: queryMock };
  }),
}));

const workspaceUrls = (urls: { customUrl?: string; subdomainUrl?: string }) =>
  queryMock.mockResolvedValue({ currentWorkspace: { workspaceUrls: urls } });

describe('fetchWorkspaceBaseUrl', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should prefer the custom domain and drop its trailing slash', async () => {
    workspaceUrls({
      customUrl: 'https://crm.acme.com/',
      subdomainUrl: 'https://acme.twenty.com',
    });

    await expect(fetchWorkspaceBaseUrl()).resolves.toBe('https://crm.acme.com');
  });

  it('should fall back to the subdomain when there is no custom domain', async () => {
    workspaceUrls({ subdomainUrl: 'https://acme.twenty.com' });

    await expect(fetchWorkspaceBaseUrl()).resolves.toBe(
      'https://acme.twenty.com',
    );
  });

  it('should give up on a lookup that does not answer in time', async () => {
    queryMock.mockReturnValue(new Promise(() => undefined));

    const lookup = fetchWorkspaceBaseUrl();

    await vi.advanceTimersByTimeAsync(5000);

    await expect(lookup).resolves.toBeUndefined();
    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  it('should return nothing when the lookup fails', async () => {
    queryMock.mockRejectedValue(new Error('metadata unavailable'));

    await expect(fetchWorkspaceBaseUrl()).resolves.toBeUndefined();
  });
});
