import { findMarketplaceBuiltInApplication } from 'src/engine/core-modules/application/application-marketplace/utils/find-marketplace-built-in-application.util';
import { VERIFIED_OAUTH_CLIENTS } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/constants/verified-oauth-clients.constant';
import { isDefined } from 'twenty-shared/utils';

export const findVerifiedOAuthClientLogoPath = (
  universalIdentifier: string,
): string | null => {
  const verifiedClient = VERIFIED_OAUTH_CLIENTS.find(
    (client) =>
      'registrationUniversalIdentifier' in client &&
      client.registrationUniversalIdentifier ===
        universalIdentifier.toLowerCase(),
  );

  if (!isDefined(verifiedClient)) {
    return null;
  }

  return (
    findMarketplaceBuiltInApplication(
      verifiedClient.marketplaceAppUniversalIdentifier,
    )?.logoPath ?? null
  );
};
