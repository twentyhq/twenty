import { VERIFIED_OAUTH_CLIENTS } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/constants/verified-oauth-clients.constant';

export const isVerifiedOAuthClientUniversalIdentifier = (
  universalIdentifier: string,
): boolean =>
  VERIFIED_OAUTH_CLIENTS.some(
    (verifiedClient) =>
      'registrationUniversalIdentifier' in verifiedClient &&
      verifiedClient.registrationUniversalIdentifier ===
        universalIdentifier.toLowerCase(),
  );
