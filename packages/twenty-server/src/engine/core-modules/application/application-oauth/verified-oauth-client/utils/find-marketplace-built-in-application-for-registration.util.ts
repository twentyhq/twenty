import { isDefined } from 'twenty-shared/utils';

import { type MarketplaceBuiltInApplication } from 'src/engine/core-modules/application/application-marketplace/types/marketplace-built-in-application.type';
import { findMarketplaceBuiltInApplication } from 'src/engine/core-modules/application/application-marketplace/utils/find-marketplace-built-in-application.util';
import { type VerifiableOAuthClientRegistration } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/types/verifiable-oauth-client-registration.type';
import { findVerifiedOAuthClientForRegistration } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/utils/find-verified-oauth-client-for-registration.util';

export const findMarketplaceBuiltInApplicationForRegistration = (
  registration: VerifiableOAuthClientRegistration | null,
): MarketplaceBuiltInApplication | undefined => {
  if (!isDefined(registration)) {
    return undefined;
  }

  const verifiedClient = findVerifiedOAuthClientForRegistration(registration);

  return isDefined(verifiedClient)
    ? findMarketplaceBuiltInApplication(
        verifiedClient.marketplaceAppUniversalIdentifier,
      )
    : undefined;
};
