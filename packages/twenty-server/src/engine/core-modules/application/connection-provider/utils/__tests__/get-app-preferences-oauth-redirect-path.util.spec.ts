import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

import { getAppPreferencesOAuthRedirectPath } from 'src/engine/core-modules/application/connection-provider/utils/get-app-preferences-oauth-redirect-path.util';

const APPLICATION_ID = '1f326c86-5378-4eae-8d21-d0af79a311b4';
const CONNECTED_ACCOUNT_ID = 'd4c26188-3ba8-4ac3-b97f-17fe4eb716d5';
const ACCOUNT_PATH = getSettingsPath(SettingsPath.AppPreferencesAccount, {
  connectedAccountId: CONNECTED_ACCOUNT_ID,
});
const APPLICATION_PATH = getSettingsPath(
  SettingsPath.AppPreferencesApplication,
  { applicationId: APPLICATION_ID },
);

describe('getAppPreferencesOAuthRedirectPath', () => {
  it('retains the account entry only for the account being reconnected', () => {
    expect(
      getAppPreferencesOAuthRedirectPath({
        applicationId: APPLICATION_ID,
        redirectLocation: ACCOUNT_PATH,
        reconnectingConnectedAccountId: CONNECTED_ACCOUNT_ID,
      }),
    ).toBe(ACCOUNT_PATH);
  });

  it.each([undefined, null, 'not-a-uuid', APPLICATION_ID])(
    'rejects an account route with a different or invalid reconnecting ID %s',
    (reconnectingConnectedAccountId) => {
      expect(
        getAppPreferencesOAuthRedirectPath({
          applicationId: APPLICATION_ID,
          redirectLocation: ACCOUNT_PATH,
          reconnectingConnectedAccountId,
        }),
      ).toBeNull();
    },
  );

  it.each([
    `https://example.com${ACCOUNT_PATH}`,
    `${ACCOUNT_PATH}?redirect=https://example.com`,
    `${ACCOUNT_PATH}#custom`,
    `/settings/app-preferences/accounts/../accounts/${CONNECTED_ACCOUNT_ID}`,
  ])('rejects noncanonical account redirects %s', (redirectLocation) => {
    expect(
      getAppPreferencesOAuthRedirectPath({
        applicationId: APPLICATION_ID,
        reconnectingConnectedAccountId: CONNECTED_ACCOUNT_ID,
        redirectLocation,
      }),
    ).toBeNull();
  });

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
