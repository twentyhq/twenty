import { VERIFIED_OAUTH_CLIENTS } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/constants/verified-oauth-clients.constant';
import { type VerifiedOAuthClient } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/types/verified-oauth-client.type';

export const findVerifiedOAuthClientForClientIdMetadataDocumentUrl = (
  clientId: string,
): VerifiedOAuthClient | undefined =>
  VERIFIED_OAUTH_CLIENTS.find(
    (verifiedClient) => verifiedClient.clientIdMetadataDocumentUrl === clientId,
  );
