import { getApplicationPreferencesPostConnectPath } from '@/settings/app-preferences/utils/getApplicationPreferencesPostConnectPath';

const APPLICATION_ID = '0f1e2d3c-4b5a-4968-8776-655443322110';

describe('getApplicationPreferencesPostConnectPath', () => {
  it('should land on the general tab when the application has no user settings item', () => {
    expect(
      getApplicationPreferencesPostConnectPath({
        applicationId: APPLICATION_ID,
        settingsMenuItems: [],
      }),
    ).toBe(`/settings/app-preferences/${APPLICATION_ID}#general`);
  });

  it('should land on the first user settings item, using its slug', () => {
    expect(
      getApplicationPreferencesPostConnectPath({
        applicationId: APPLICATION_ID,
        settingsMenuItems: [
          { universalIdentifier: 'first', slug: 'sync' },
          { universalIdentifier: 'second', slug: null },
        ],
      }),
    ).toBe(`/settings/app-preferences/${APPLICATION_ID}#sync`);
  });

  it('should fall back to the universalIdentifier of an item without a slug', () => {
    expect(
      getApplicationPreferencesPostConnectPath({
        applicationId: APPLICATION_ID,
        settingsMenuItems: [{ universalIdentifier: 'first', slug: null }],
      }),
    ).toBe(`/settings/app-preferences/${APPLICATION_ID}#first`);
  });
});
