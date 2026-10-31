import { isNonEmptyArray } from 'twenty-shared/utils';

import { WELL_KNOWN_OAUTH_CLIENTS } from 'src/engine/core-modules/application/well-known-oauth-client/constants/well-known-oauth-clients.constant';
import { type WellKnownOAuthClientDefinition } from 'src/engine/core-modules/application/well-known-oauth-client/types/well-known-oauth-client-definition.type';
import { isRedirectUriAllowedForWellKnownOAuthClient } from 'src/engine/core-modules/application/well-known-oauth-client/utils/is-redirect-uri-allowed-for-well-known-oauth-client.util';

// Codes only reach registered callbacks, so a client whose every callback belongs to the vendor can only be the vendor;
// one vendor callback next to a foreign one proves nothing
export const findWellKnownOAuthClientByRedirectUris = (
  redirectUris: string[],
): WellKnownOAuthClientDefinition | undefined => {
  if (!isNonEmptyArray(redirectUris)) {
    return undefined;
  }

  return WELL_KNOWN_OAUTH_CLIENTS.find((wellKnownOAuthClient) =>
    redirectUris.every((redirectUri) =>
      isRedirectUriAllowedForWellKnownOAuthClient({
        redirectUri,
        wellKnownOAuthClient,
      }),
    ),
  );
};
