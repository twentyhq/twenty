import { VERIFIED_OAUTH_CLIENTS } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/constants/verified-oauth-clients.constant';
import { type VerifiedOAuthClient } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/types/verified-oauth-client.type';
import { isVerifiedOAuthClientRegistration } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/utils/is-verified-oauth-client-registration.util';
import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';

type VerifiableRegistration = Pick<
  ApplicationRegistrationEntity,
  | 'universalIdentifier'
  | 'sourceType'
  | 'ownerWorkspaceId'
  | 'createdByUserId'
  | 'oAuthClientSecretHash'
  | 'oAuthClientId'
>;

const isRegistrationOfVerifiedClient = ({
  verifiedClient,
  registration,
}: {
  verifiedClient: VerifiedOAuthClient;
  registration: VerifiableRegistration;
}): boolean => {
  if ('clientIdMetadataDocumentUrl' in verifiedClient) {
    return (
      verifiedClient.clientIdMetadataDocumentUrl === registration.oAuthClientId
    );
  }

  return (
    isVerifiedOAuthClientRegistration(registration) &&
    verifiedClient.registrationUniversalIdentifier ===
      registration.universalIdentifier.toLowerCase()
  );
};

export const findVerifiedOAuthClientForRegistration = (
  registration: VerifiableRegistration,
): VerifiedOAuthClient | undefined =>
  VERIFIED_OAUTH_CLIENTS.find((verifiedClient) =>
    isRegistrationOfVerifiedClient({ verifiedClient, registration }),
  );
