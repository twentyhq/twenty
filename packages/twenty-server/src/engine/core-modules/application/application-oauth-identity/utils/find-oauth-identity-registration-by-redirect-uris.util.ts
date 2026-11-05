import { isRedirectUriAllowedByOAuthIdentity } from 'twenty-shared/application';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { type ApplicationOAuthIdentityRegistration } from 'src/engine/core-modules/application/application-oauth-identity/types/application-oauth-identity-registration.type';

export const findOAuthIdentityRegistrationByRedirectUris = ({
  identityRegistrations,
  redirectUris,
}: {
  identityRegistrations: ApplicationOAuthIdentityRegistration[];
  redirectUris: string[];
}): ApplicationOAuthIdentityRegistration | undefined => {
  if (!isNonEmptyArray(redirectUris)) {
    return undefined;
  }

  return identityRegistrations.find(({ oAuthIdentity }) =>
    redirectUris.every((redirectUri) =>
      isRedirectUriAllowedByOAuthIdentity({ oAuthIdentity, redirectUri }),
    ),
  );
};
