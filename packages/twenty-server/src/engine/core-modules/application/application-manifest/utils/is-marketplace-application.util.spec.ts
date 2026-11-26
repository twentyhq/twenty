import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { isMarketplaceApplication } from 'src/engine/core-modules/application/application-manifest/utils/is-marketplace-application.util';

const WORKSPACE_CUSTOM_APPLICATION = 'workspace-custom-application';

describe('isMarketplaceApplication', () => {
  it.each([
    ApplicationRegistrationSourceType.NPM,
    ApplicationRegistrationSourceType.TARBALL,
    ApplicationRegistrationSourceType.LOCAL,
  ])('should count a %s app', (sourceType) => {
    expect(
      isMarketplaceApplication({
        universalIdentifier: 'application',
        sourceType,
        workspaceCustomApplicationUniversalIdentifier:
          WORKSPACE_CUSTOM_APPLICATION,
      }),
    ).toBe(true);
  });

  it.each([
    [WORKSPACE_CUSTOM_APPLICATION, ApplicationRegistrationSourceType.LOCAL],
    [
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      ApplicationRegistrationSourceType.LOCAL,
    ],
    ['application', ApplicationRegistrationSourceType.OAUTH_ONLY],
  ])('should not count %s (%s)', (universalIdentifier, sourceType) => {
    expect(
      isMarketplaceApplication({
        universalIdentifier,
        sourceType,
        workspaceCustomApplicationUniversalIdentifier:
          WORKSPACE_CUSTOM_APPLICATION,
      }),
    ).toBe(false);
  });
});
