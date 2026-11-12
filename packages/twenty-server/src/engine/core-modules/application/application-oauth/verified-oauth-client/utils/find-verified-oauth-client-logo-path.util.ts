import { VERIFIED_OAUTH_CLIENTS } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/constants/verified-oauth-clients.constant';

export const findVerifiedOAuthClientLogoPath = (
  universalIdentifier: string,
): string | null =>
  VERIFIED_OAUTH_CLIENTS.find(
    (verifiedClient) =>
      'registrationUniversalIdentifier' in verifiedClient &&
      verifiedClient.registrationUniversalIdentifier ===
        universalIdentifier.toLowerCase(),
  )?.logoPath ?? null;
