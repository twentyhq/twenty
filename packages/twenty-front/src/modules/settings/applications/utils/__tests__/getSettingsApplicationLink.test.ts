import { getSettingsApplicationLink } from '@/settings/applications/utils/getSettingsApplicationLink';

describe('getSettingsApplicationLink', () => {
  it('links to the application detail page', () => {
    expect(
      getSettingsApplicationLink({
        linkTarget: 'applicationDetail',
        applicationId: 'acme-application-id',
      }),
    ).toBe('/settings/applications/acme-application-id');
  });

  it('links to the member preferences of the application', () => {
    expect(
      getSettingsApplicationLink({
        linkTarget: 'applicationPreferences',
        applicationId: 'acme-application-id',
      }),
    ).toBe('/settings/accounts/applications/acme-application-id');
  });
});
