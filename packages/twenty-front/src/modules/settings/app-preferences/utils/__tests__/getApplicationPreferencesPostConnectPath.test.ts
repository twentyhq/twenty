import { getApplicationPreferencesPostConnectPath } from '@/settings/app-preferences/utils/getApplicationPreferencesPostConnectPath';

describe('getApplicationPreferencesPostConnectPath', () => {
  it('lands on the first settings tab of the application', () => {
    expect(
      getApplicationPreferencesPostConnectPath({
        applicationId: 'application-id',
        settingsMenuItems: [
          { universalIdentifier: 'sync-tab' },
          { universalIdentifier: 'other-tab' },
        ],
      }),
    ).toBe('/settings/app-preferences/application-id#sync-tab');
  });

  it('lands on the general tab when the application has no settings tab', () => {
    expect(
      getApplicationPreferencesPostConnectPath({
        applicationId: 'application-id',
        settingsMenuItems: [],
      }),
    ).toBe('/settings/app-preferences/application-id#general');
  });
});
