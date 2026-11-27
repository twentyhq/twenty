import { findMarketplaceConnectListing } from 'src/engine/core-modules/application/application-marketplace/utils/find-marketplace-connect-listing.util';
import { TWENTY_CLI_APPLICATION_REGISTRATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-cli-application-registration.constant';

describe('findMarketplaceConnectListing', () => {
  it.each([
    TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier,
    TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier.toUpperCase(),
  ])('should find the Twenty CLI card by %s', (universalIdentifier) => {
    expect(findMarketplaceConnectListing(universalIdentifier)?.name).toBe(
      'Twenty CLI',
    );
  });

  it('should find nothing for another identifier', () => {
    expect(
      findMarketplaceConnectListing('2b1f0d5e-6f0f-4f0e-9a43-0f6b3c1f2a10'),
    ).toBeUndefined();
  });
});
