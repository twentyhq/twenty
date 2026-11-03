import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getWorkspaceBranding } from 'src/logic-functions/data/get-workspace-branding.util';

const metadataQueryMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/metadata', () => ({
  MetadataApiClient: class {
    query = metadataQueryMock;
  },
}));

const fetchMock = vi.fn();

describe('getWorkspaceBranding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('collapses line breaks in the workspace name onto one line', async () => {
    metadataQueryMock.mockResolvedValue({
      currentWorkspace: { logo: null, displayName: '  Acme\nInternal Ops ' },
    });

    expect(await getWorkspaceBranding()).toEqual({
      logo: undefined,
      displayName: 'Acme Internal Ops',
    });
  });

  it('keeps the workspace name when the logo download throws', async () => {
    metadataQueryMock.mockResolvedValue({
      currentWorkspace: {
        logo: 'https://files.test/logo.png',
        displayName: 'Acme',
      },
    });
    fetchMock.mockRejectedValue(new Error('timed out'));

    expect(await getWorkspaceBranding()).toEqual({
      logo: undefined,
      displayName: 'Acme',
    });
  });
});
