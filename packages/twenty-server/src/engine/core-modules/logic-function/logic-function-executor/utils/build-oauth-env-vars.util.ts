import {
  buildOAuthEnvVarPrefix,
  OAUTH_ENV_VAR_FIELD,
} from 'twenty-shared/application';

import { type OAuthEnvBindings } from 'src/engine/core-modules/logic-function/logic-function-executor/types/oauth-env-bindings.type';

export const buildOAuthEnvVars = (
  bindings: Record<string, OAuthEnvBindings>,
): Record<string, string> => {
  const envVars: Record<string, string> = {};

  for (const [providerName, binding] of Object.entries(bindings)) {
    const prefix = buildOAuthEnvVarPrefix(providerName);

    envVars[`${prefix}${OAUTH_ENV_VAR_FIELD.CONNECTED}`] = binding.accessToken
      ? 'true'
      : 'false';

    if (binding.accessToken) {
      envVars[`${prefix}${OAUTH_ENV_VAR_FIELD.ACCESS_TOKEN}`] =
        binding.accessToken;
    }

    if (binding.scopes && binding.scopes.length > 0) {
      envVars[`${prefix}${OAUTH_ENV_VAR_FIELD.SCOPES}`] =
        binding.scopes.join(' ');
    }

    if (binding.handle) {
      envVars[`${prefix}${OAUTH_ENV_VAR_FIELD.HANDLE}`] = binding.handle;
    }

    if (binding.connectedAccountId) {
      envVars[`${prefix}${OAUTH_ENV_VAR_FIELD.CONNECTED_ACCOUNT_ID}`] =
        binding.connectedAccountId;
    }
  }

  return envVars;
};
