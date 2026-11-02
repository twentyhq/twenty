import {
  DEFAULT_APP_ACCESS_TOKEN_NAME,
  DEFAULT_APP_APPLICATION_ACCESS_TOKEN_NAME,
} from 'twenty-shared/application-runtime';

type AccessTokenHolder = 'application' | 'caller';

const ACCESS_TOKEN_NAME_BY_HOLDER: Record<AccessTokenHolder, string> = {
  application: DEFAULT_APP_APPLICATION_ACCESS_TOKEN_NAME,
  caller: DEFAULT_APP_ACCESS_TOKEN_NAME,
};

const getAccessTokenPreferring = (
  preferredHolder: AccessTokenHolder,
): string | undefined => {
  const fallbackHolder: AccessTokenHolder =
    preferredHolder === 'application' ? 'caller' : 'application';

  return (
    process.env[ACCESS_TOKEN_NAME_BY_HOLDER[preferredHolder]] ??
    process.env[ACCESS_TOKEN_NAME_BY_HOLDER[fallbackHolder]]
  );
};

export const getApplicationAccessToken = (): string | undefined =>
  getAccessTokenPreferring('application');

export const getCallerAccessToken = (): string | undefined =>
  getAccessTokenPreferring('caller');
