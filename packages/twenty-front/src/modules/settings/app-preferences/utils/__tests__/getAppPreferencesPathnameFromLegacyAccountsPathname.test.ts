import { getAppPreferencesPathnameFromLegacyAccountsPathname } from '@/settings/app-preferences/utils/getAppPreferencesPathnameFromLegacyAccountsPathname';

describe('getAppPreferencesPathnameFromLegacyAccountsPathname', () => {
  it.each([
    ['/settings/accounts', '/settings/app-preferences'],
    ['/settings/accounts/', '/settings/app-preferences'],
    ['/settings/accounts/emails', '/settings/app-preferences'],
    ['/settings/accounts/calendars', '/settings/app-preferences'],
    [
      '/settings/accounts/detail/account-id',
      '/settings/app-preferences/accounts/account-id',
    ],
    ['/settings/accounts/apps/google', '/settings/app-preferences/google'],
    [
      '/settings/accounts/applications/application-id',
      '/settings/app-preferences/application-id',
    ],
    ['/settings/accounts/new', '/settings/app-preferences/accounts/new'],
    [
      '/settings/accounts/configuration/account-id',
      '/settings/app-preferences/accounts/account-id/configuration',
    ],
    [
      '/settings/accounts/new-imap-smtp-caldav-connection',
      '/settings/app-preferences/accounts/new-imap-smtp-caldav-connection',
    ],
    [
      '/settings/accounts/edit-imap-smtp-caldav-connection/account-id',
      '/settings/app-preferences/accounts/account-id/edit-imap-smtp-caldav-connection',
    ],
    ['/settings/accounts/unknown/page', '/settings/app-preferences'],
  ])('maps %s to %s', (legacyAccountsPathname, appPreferencesPathname) => {
    expect(
      getAppPreferencesPathnameFromLegacyAccountsPathname(
        legacyAccountsPathname,
      ),
    ).toBe(appPreferencesPathname);
  });
});
