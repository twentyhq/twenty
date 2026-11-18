import { isDefined } from 'twenty-shared/utils';

import { VERIFIED_OAUTH_CLIENTS } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/constants/verified-oauth-clients.constant';
import { type VerifiedOAuthClient } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/types/verified-oauth-client.type';
import { type VerifiableOAuthClientRegistration } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/types/verifiable-oauth-client-registration.type';
import { isVerifiedOAuthClientRegistration } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/utils/is-verified-oauth-client-registration.util';

const isRegistrationOfVerifiedClient = ({
  verifiedClient,
  registration,
}: {
  verifiedClient: VerifiedOAuthClient;
  registration: VerifiableOAuthClientRegistration;
}): boolean => {
  if (isVerifiedOAuthClientRegistration(registration)) {
    return (
      verifiedClient.universalIdentifier ===
      registration.universalIdentifier.toLowerCase()
    );
  }

  // TODO(felix): remove once an upgrade command moves per-URL registrations onto their card's registration
  return (
    isDefined(verifiedClient.clientIdMetadataDocumentUrl) &&
    verifiedClient.clientIdMetadataDocumentUrl === registration.oAuthClientId
  );
};

export const findVerifiedOAuthClientForRegistration = (
  registration: VerifiableOAuthClientRegistration,
): VerifiedOAuthClient | undefined =>
  VERIFIED_OAUTH_CLIENTS.find((verifiedClient) =>
    isRegistrationOfVerifiedClient({ verifiedClient, registration }),
  );
