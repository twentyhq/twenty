import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

import { getAppPreferencesOAuthRedirectPath } from 'src/engine/core-modules/application/connection-provider/utils/get-app-preferences-oauth-redirect-path.util';

const APPLICATION_ID = '1f326c86-5378-4eae-8d21-d0af79a311b4';
const APPLICATION_PATH = getSettingsPath(
  SettingsPath.AppPreferencesApplication,
  { applicationId: APPLICATION_ID },
);

describe('getAppPreferencesOAuthRedirectPath', () => {
  it.each([getSettingsPath(SettingsPath.AppPreferences), APPLICATION_PATH])(
    'allows the canonical personal route %s',
    (redirectLocation) => {
      expect(
        getAppPreferencesOAuthRedirectPath({
          applicationId: APPLICATION_ID,
          redirectLocation,
        }),
      ).toBe(redirectLocation);
    },
  );

  it.each([
    null,
    undefined,
    '',
    getSettingsPath(SettingsPath.Accounts),
    getSettingsPath(SettingsPath.AppPreferencesApplication, {
      applicationId: '979602ff-9c1d-4e3c-a058-65711100cc43',
    }),
    `https://example.com${APPLICATION_PATH}`,
    `//example.com${APPLICATION_PATH}`,
    `${APPLICATION_PATH}?redirect=https://example.com`,
    `${APPLICATION_PATH}#settings`,
    `/settings/app-preferences/apps/../apps/${APPLICATION_ID}`,
  ])('rejects a noncanonical personal route %s', (redirectLocation) => {
    expect(
      getAppPreferencesOAuthRedirectPath({
        applicationId: APPLICATION_ID,
        redirectLocation,
      }),
    ).toBeNull();
  });

  it.each(['not-a-uuid', '..', `${APPLICATION_ID}/../other`])(
    'rejects app-specific routes for invalid application ID %s',
    (applicationId) => {
      expect(
        getAppPreferencesOAuthRedirectPath({
          applicationId,
          redirectLocation: getSettingsPath(
            SettingsPath.AppPreferencesApplication,
            { applicationId },
          ),
        }),
      ).toBeNull();
    },
  );
});
