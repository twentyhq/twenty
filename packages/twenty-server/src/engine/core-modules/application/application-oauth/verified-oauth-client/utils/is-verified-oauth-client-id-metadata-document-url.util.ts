import { VERIFIED_OAUTH_CLIENTS } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/constants/verified-oauth-clients.constant';

export const isVerifiedOAuthClientIdMetadataDocumentUrl = (
  clientId: string,
): boolean =>
  VERIFIED_OAUTH_CLIENTS.some(
    (verifiedClient) =>
      'clientIdMetadataDocumentUrl' in verifiedClient &&
      verifiedClient.clientIdMetadataDocumentUrl === clientId,
  );
