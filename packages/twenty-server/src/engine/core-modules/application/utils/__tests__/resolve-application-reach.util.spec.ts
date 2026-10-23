import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { resolveApplicationReach } from 'src/engine/core-modules/application/utils/resolve-application-reach.util';

const WORKSPACE_CUSTOM_APPLICATION_ID = 'c3d4e5f6-a7b8-4c9d-8e0f-1a2b3c4d5e6f';

const INSTALLED_APPLICATION_ID = 'b1a4c0d2-6e1f-4a6b-9c1d-0f2e3a4b5c6d';

describe('resolveApplicationReach', () => {
  it('should give a caller without an application the whole workspace', () => {
    expect(
      resolveApplicationReach({
        callingApplication: undefined,
        workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
      }),
    ).toBe('workspace');
  });

  it('should give an OAuth-only application the whole workspace', () => {
    expect(
      resolveApplicationReach({
        callingApplication: {
          id: INSTALLED_APPLICATION_ID,
          universalIdentifier: INSTALLED_APPLICATION_ID,
          sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
        },
        workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
      }),
    ).toBe('workspace');
  });

  it('should make the workspace custom application the composer', () => {
    expect(
      resolveApplicationReach({
        callingApplication: {
          id: WORKSPACE_CUSTOM_APPLICATION_ID,
          universalIdentifier: WORKSPACE_CUSTOM_APPLICATION_ID,
          sourceType: ApplicationRegistrationSourceType.LOCAL,
        },
        workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
      }),
    ).toBe('composer');
  });

  it('should make the standard application the composer', () => {
    expect(
      resolveApplicationReach({
        callingApplication: {
          id: INSTALLED_APPLICATION_ID,
          universalIdentifier: TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          sourceType: ApplicationRegistrationSourceType.LOCAL,
        },
        workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
      }),
    ).toBe('composer');
  });

  it.each([
    ApplicationRegistrationSourceType.LOCAL,
    ApplicationRegistrationSourceType.NPM,
    ApplicationRegistrationSourceType.TARBALL,
  ])('should confine an installed %s application', (sourceType) => {
    expect(
      resolveApplicationReach({
        callingApplication: {
          id: INSTALLED_APPLICATION_ID,
          universalIdentifier: INSTALLED_APPLICATION_ID,
          sourceType,
        },
        workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
      }),
    ).toBe('confined');
  });
});
