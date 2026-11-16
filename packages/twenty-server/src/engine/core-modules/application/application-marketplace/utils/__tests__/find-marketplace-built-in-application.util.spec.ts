import { findMarketplaceBuiltInApplication } from 'src/engine/core-modules/application/application-marketplace/utils/find-marketplace-built-in-application.util';
import { TWENTY_CLI_APPLICATION_REGISTRATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-cli-application-registration.constant';

describe('findMarketplaceBuiltInApplication', () => {
  it.each([
    TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier,
    TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier.toUpperCase(),
  ])('should find the Twenty CLI card by %s', (universalIdentifier) => {
    expect(findMarketplaceBuiltInApplication(universalIdentifier)?.name).toBe(
      'Twenty CLI',
    );
  });

  it('should find nothing for another identifier', () => {
    expect(
      findMarketplaceBuiltInApplication('2b1f0d5e-6f0f-4f0e-9a43-0f6b3c1f2a10'),
    ).toBeUndefined();
  });
});
