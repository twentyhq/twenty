import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { isClientIdMetadataDocumentUrl } from 'src/engine/core-modules/application/application-registration/client-id-metadata-document/utils/is-client-id-metadata-document-url.util';
import { matchesRegisteredRedirectUri } from 'src/engine/core-modules/auth/utils/matches-registered-redirect-uri.util';

const isCoveredBy = (uris: string[], otherUris: string[]): boolean =>
  uris.every((uri) =>
    otherUris.some((otherUri) => matchesRegisteredRedirectUri(otherUri, uri)),
  );

export const isEquivalentDynamicRegistration = (
  registration: Pick<
    ApplicationRegistrationEntity,
    'oAuthClientId' | 'oAuthRedirectUris' | 'oAuthScopes'
  >,
  request: { redirectUris: string[]; scopes: string[] },
): boolean => {
  if (isClientIdMetadataDocumentUrl(registration.oAuthClientId)) {
    return false;
  }

  const registeredScopes = new Set(registration.oAuthScopes);
  const requestedScopes = new Set(request.scopes);

  return (
    registeredScopes.size === requestedScopes.size &&
    [...requestedScopes].every((scope) => registeredScopes.has(scope)) &&
    isCoveredBy(request.redirectUris, registration.oAuthRedirectUris) &&
    isCoveredBy(registration.oAuthRedirectUris, request.redirectUris)
  );
};
