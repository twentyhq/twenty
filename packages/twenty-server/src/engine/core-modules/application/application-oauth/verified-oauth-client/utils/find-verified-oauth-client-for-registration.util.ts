import { VERIFIED_OAUTH_CLIENTS } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/constants/verified-oauth-clients.constant';
import { type VerifiedOAuthClient } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/types/verified-oauth-client.type';
import { isVerifiedOAuthClientRegistration } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/utils/is-verified-oauth-client-registration.util';
import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';

export const findVerifiedOAuthClientForRegistration = (
  registration: Pick<
    ApplicationRegistrationEntity,
    | 'universalIdentifier'
    | 'sourceType'
    | 'ownerWorkspaceId'
    | 'createdByUserId'
    | 'oAuthClientSecretHash'
    | 'oAuthClientId'
  >,
): VerifiedOAuthClient | undefined =>
  VERIFIED_OAUTH_CLIENTS.find((verifiedClient) =>
    'registrationUniversalIdentifier' in verifiedClient
      ? isVerifiedOAuthClientRegistration(registration) &&
        verifiedClient.registrationUniversalIdentifier ===
          registration.universalIdentifier.toLowerCase()
      : verifiedClient.clientIdMetadataDocumentUrl ===
        registration.oAuthClientId,
  );
