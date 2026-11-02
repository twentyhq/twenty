import { isString } from '@sniptt/guards';

import { type WellKnownOAuthClientDefinition } from 'src/engine/core-modules/application/well-known-oauth-client/types/well-known-oauth-client-definition.type';

export const isRedirectUriAllowedForWellKnownOAuthClient = ({
  redirectUri,
  wellKnownOAuthClient,
}: {
  redirectUri: string;
  wellKnownOAuthClient: Pick<
    WellKnownOAuthClientDefinition,
    'allowedRedirectUris'
  >;
}): boolean =>
  wellKnownOAuthClient.allowedRedirectUris.some((allowedRedirectUri) =>
    isString(allowedRedirectUri)
      ? allowedRedirectUri === redirectUri
      : allowedRedirectUri.test(redirectUri),
  );
