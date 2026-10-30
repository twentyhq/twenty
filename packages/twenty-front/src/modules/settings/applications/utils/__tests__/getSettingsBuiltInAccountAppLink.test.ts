import { getSettingsBuiltInAccountAppLink } from '@/settings/applications/utils/getSettingsBuiltInAccountAppLink';

describe('getSettingsBuiltInAccountAppLink', () => {
  it('links to the application detail page', () => {
    expect(
      getSettingsBuiltInAccountAppLink({
        linkTarget: 'applicationDetail',
        builtInAccountAppId: 'google',
      }),
    ).toBe('/settings/applications/google');
  });

  it('links to the member preferences of the built-in account app', () => {
    expect(
      getSettingsBuiltInAccountAppLink({
        linkTarget: 'applicationPreferences',
        builtInAccountAppId: 'google',
      }),
    ).toBe('/settings/app-preferences/google');
  });
});
