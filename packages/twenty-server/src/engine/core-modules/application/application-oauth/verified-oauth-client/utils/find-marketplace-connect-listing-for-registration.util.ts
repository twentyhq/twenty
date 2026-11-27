import { isDefined } from 'twenty-shared/utils';

import { type MarketplaceConnectListing } from 'src/engine/core-modules/application/application-marketplace/types/marketplace-connect-listing.type';
import { findMarketplaceConnectListing } from 'src/engine/core-modules/application/application-marketplace/utils/find-marketplace-connect-listing.util';
import { type VerifiableOAuthClientRegistration } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/types/verifiable-oauth-client-registration.type';
import { findVerifiedOAuthClientForRegistration } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/utils/find-verified-oauth-client-for-registration.util';

export const findMarketplaceConnectListingForRegistration = (
  registration: VerifiableOAuthClientRegistration | null,
): MarketplaceConnectListing | undefined => {
  if (!isDefined(registration)) {
    return undefined;
  }

  const verifiedClient = findVerifiedOAuthClientForRegistration(registration);

  return isDefined(verifiedClient)
    ? findMarketplaceConnectListing(verifiedClient.universalIdentifier)
    : undefined;
};
