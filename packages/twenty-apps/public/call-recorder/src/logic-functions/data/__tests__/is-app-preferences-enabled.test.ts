import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { isAppPreferencesEnabled } from 'src/logic-functions/data/is-app-preferences-enabled.util';

const metadataQueryMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/metadata', async (importOriginal) => ({
  ...(await importOriginal<typeof import('twenty-client-sdk/metadata')>()),
  MetadataApiClient: class {
    query = metadataQueryMock;
  },
}));

const stubFeatureFlags = (
  featureFlags: { key: string; value: boolean }[] | null,
) =>
  metadataQueryMock.mockResolvedValue({ currentWorkspace: { featureFlags } });

describe('isAppPreferencesEnabled', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    metadataQueryMock.mockReset();
  });

  afterEach(() => vi.restoreAllMocks());

  it('is on when the workspace enables the flag', async () => {
    stubFeatureFlags([
      { key: 'IS_AI_CHAT_INBOX_ENABLED', value: false },
      { key: 'IS_APP_PREFERENCES_ENABLED', value: true },
    ]);

    expect(await isAppPreferencesEnabled()).toBe(true);
  });

  it('is off when the workspace disables the flag', async () => {
    stubFeatureFlags([{ key: 'IS_APP_PREFERENCES_ENABLED', value: false }]);

    expect(await isAppPreferencesEnabled()).toBe(false);
  });

  it('is off when the workspace never set the flag', async () => {
    stubFeatureFlags(null);

    expect(await isAppPreferencesEnabled()).toBe(false);
  });

  it('is off when the flag cannot be read', async () => {
    metadataQueryMock.mockRejectedValue(new Error('Service unavailable'));

    expect(await isAppPreferencesEnabled()).toBe(false);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('Service unavailable'),
    );
  });
});
