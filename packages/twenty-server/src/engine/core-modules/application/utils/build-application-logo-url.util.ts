import { isDefined } from 'twenty-shared/utils';

import { findMarketplaceConnectListing } from 'src/engine/core-modules/application/application-marketplace/utils/find-marketplace-connect-listing.util';
import { buildPublicAssetLogoUrl } from 'src/engine/core-modules/application/utils/build-public-asset-logo-url.util';

// The installed app's bundled logo wins; an OAuth-only app has none, so its store card's logo stands in
export const buildApplicationLogoUrl = ({
  application,
  workspaceId,
  serverUrl,
  frontBaseUrl,
}: {
  application: { id: string; logo: string | null; universalIdentifier: string };
  workspaceId: string;
  serverUrl: string;
  frontBaseUrl: string;
}): string | null => {
  const bundledLogoUrl = buildPublicAssetLogoUrl({
    logo: application.logo,
    serverUrl,
    workspaceId,
    applicationId: application.id,
  });

  if (isDefined(bundledLogoUrl)) {
    return bundledLogoUrl;
  }

  const marketplaceConnectListing = findMarketplaceConnectListing(
    application.universalIdentifier,
  );

  return isDefined(marketplaceConnectListing)
    ? new URL(marketplaceConnectListing.logoPath, frontBaseUrl).toString()
    : null;
};
