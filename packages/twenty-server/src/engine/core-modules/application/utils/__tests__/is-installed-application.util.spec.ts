import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { isInstalledApplication } from 'src/engine/core-modules/application/utils/is-installed-application.util';

const WORKSPACE_CUSTOM_APPLICATION_ID = 'b1a4c0d2-6e1f-4a6b-9c1d-0f2e3a4b5c6d';

const INSTALLED_APPLICATION = {
  id: 'e5f6a7b8-c9d0-4e1f-a2b3-c4d5e6f7a8b9',
  universalIdentifier: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
  sourceType: ApplicationRegistrationSourceType.NPM,
};

describe('isInstalledApplication', () => {
  it('should flag an installed application', () => {
    expect(
      isInstalledApplication({
        application: INSTALLED_APPLICATION,
        workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
      }),
    ).toBe(true);
  });

  it('should flag an installed application when the workspace custom application is unknown', () => {
    expect(
      isInstalledApplication({
        application: INSTALLED_APPLICATION,
        workspaceCustomApplicationId: undefined,
      }),
    ).toBe(true);
  });

  it.each([
    { caller: 'no application', application: undefined },
    {
      caller: 'an OAuth-only application',
      application: {
        ...INSTALLED_APPLICATION,
        sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
      },
    },
    {
      caller: 'the workspace custom application',
      application: {
        ...INSTALLED_APPLICATION,
        id: WORKSPACE_CUSTOM_APPLICATION_ID,
        sourceType: ApplicationRegistrationSourceType.LOCAL,
      },
    },
    {
      caller: 'the Twenty standard application',
      application: {
        ...INSTALLED_APPLICATION,
        universalIdentifier: TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
        sourceType: ApplicationRegistrationSourceType.LOCAL,
      },
    },
  ])('should not flag $caller', ({ application }) => {
    expect(
      isInstalledApplication({
        application,
        workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
      }),
    ).toBe(false);
  });
});
