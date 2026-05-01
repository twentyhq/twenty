import {
  buildOAuthEnvVarPrefix,
  OAUTH_ENV_VAR_FIELD,
} from 'twenty-shared/application';

import { type OAuthBinding } from '@/sdk/logic-function/oauth/oauth-binding.type';

// Returns the OAuth binding even when not connected (the consumer is
// expected to check `isConnected`). Use `useOAuth` instead if you want a
// non-null `accessToken` that throws when missing.
export const useOptionalOAuth = (providerName: string): OAuthBinding => {
  const prefix = buildOAuthEnvVarPrefix(providerName);

  const scopesRaw =
    process.env[`${prefix}${OAUTH_ENV_VAR_FIELD.SCOPES}`] ?? '';

  return {
    isConnected:
      process.env[`${prefix}${OAUTH_ENV_VAR_FIELD.CONNECTED}`] === 'true',
    accessToken:
      process.env[`${prefix}${OAUTH_ENV_VAR_FIELD.ACCESS_TOKEN}`] ?? null,
    handle: process.env[`${prefix}${OAUTH_ENV_VAR_FIELD.HANDLE}`] ?? null,
    connectedAccountId:
      process.env[`${prefix}${OAUTH_ENV_VAR_FIELD.CONNECTED_ACCOUNT_ID}`] ??
      null,
    scopes: scopesRaw ? scopesRaw.split(/[\s,]+/).filter(Boolean) : [],
  };
};
