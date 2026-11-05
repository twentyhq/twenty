import { isRedirectUriAllowedByOAuthIdentity } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { getApplicationOAuthIdentity } from 'src/engine/core-modules/application/application-oauth-identity/utils/get-application-oauth-identity.util';
import { doRedirectUrisMatch } from 'src/engine/core-modules/application/application-registration/utils/do-redirect-uris-match.util';
import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';

export const isRedirectUriRegisteredForApplicationRegistration = ({
  applicationRegistration,
  redirectUri,
}: {
  applicationRegistration: Pick<
    ApplicationRegistrationEntity,
    'sourceType' | 'sourcePackage' | 'manifest' | 'oAuthRedirectUris'
  >;
  redirectUri: string;
}): boolean => {
  const oAuthIdentity = getApplicationOAuthIdentity(applicationRegistration);

  if (isDefined(oAuthIdentity)) {
    return isRedirectUriAllowedByOAuthIdentity({ oAuthIdentity, redirectUri });
  }

  return applicationRegistration.oAuthRedirectUris.some(
    (registeredRedirectUri) =>
      doRedirectUrisMatch({ registeredRedirectUri, redirectUri }),
  );
};
