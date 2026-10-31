import { isDefined } from 'twenty-shared/utils';

import { doRedirectUrisMatch } from 'src/engine/core-modules/application/application-registration/utils/do-redirect-uris-match.util';
import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { findWellKnownOAuthClientByUniversalIdentifier } from 'src/engine/core-modules/application/well-known-oauth-client/utils/find-well-known-oauth-client-by-universal-identifier.util';
import { isRedirectUriAllowedForWellKnownOAuthClient } from 'src/engine/core-modules/application/well-known-oauth-client/utils/is-redirect-uri-allowed-for-well-known-oauth-client.util';

export const isRedirectUriRegisteredForApplicationRegistration = ({
  applicationRegistration,
  redirectUri,
}: {
  applicationRegistration: Pick<
    ApplicationRegistrationEntity,
    'universalIdentifier' | 'oAuthRedirectUris'
  >;
  redirectUri: string;
}): boolean => {
  const wellKnownOAuthClient = findWellKnownOAuthClientByUniversalIdentifier(
    applicationRegistration.universalIdentifier,
  );

  if (isDefined(wellKnownOAuthClient)) {
    return isRedirectUriAllowedForWellKnownOAuthClient({
      redirectUri,
      wellKnownOAuthClient,
    });
  }

  return applicationRegistration.oAuthRedirectUris.some(
    (registeredRedirectUri) =>
      doRedirectUrisMatch({ registeredRedirectUri, redirectUri }),
  );
};
