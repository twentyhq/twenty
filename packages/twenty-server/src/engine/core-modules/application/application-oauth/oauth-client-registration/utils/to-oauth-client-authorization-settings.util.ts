import { ALL_OAUTH_SCOPES } from 'src/engine/core-modules/application/application-oauth/constants/oauth-scopes';
import { type ResolvedOAuthClient } from 'src/engine/core-modules/application/application-oauth/oauth-client-registration/resolved-oauth-client.type';
import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';

type OAuthClientAuthorizationSettings = Pick<
  ApplicationRegistrationEntity,
  | 'oAuthClientId'
  | 'oAuthClientSecretHash'
  | 'oAuthRedirectUris'
  | 'oAuthScopes'
>;

export const toOAuthClientAuthorizationSettings = (
  resolvedClient: ResolvedOAuthClient,
): OAuthClientAuthorizationSettings => {
  if (resolvedClient.kind === 'registeredClient') {
    return resolvedClient.registration;
  }

  const { clientIdMetadataDocument, registration } = resolvedClient;

  return {
    oAuthClientId: clientIdMetadataDocument.clientId,
    oAuthClientSecretHash: null,
    oAuthRedirectUris: clientIdMetadataDocument.redirectUris,
    oAuthScopes: registration?.oAuthScopes ?? [...ALL_OAUTH_SCOPES],
  };
};
