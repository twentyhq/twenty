import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { getReachableApplicationId } from 'src/engine/core-modules/application/utils/get-reachable-application-id.util';

const WORKSPACE_CUSTOM_APPLICATION_ID = 'c3d4e5f6-a7b8-4c9d-8e0f-1a2b3c4d5e6f';

const INSTALLED_APPLICATION_ID = 'b1a4c0d2-6e1f-4a6b-9c1d-0f2e3a4b5c6d';

const workspaceCustomApplication = {
  id: WORKSPACE_CUSTOM_APPLICATION_ID,
  universalIdentifier: WORKSPACE_CUSTOM_APPLICATION_ID,
  sourceType: ApplicationRegistrationSourceType.LOCAL,
};

const installedApplication = {
  id: INSTALLED_APPLICATION_ID,
  universalIdentifier: INSTALLED_APPLICATION_ID,
  sourceType: ApplicationRegistrationSourceType.NPM,
};

describe('getReachableApplicationId', () => {
  it('should reach every application without a calling application', () => {
    expect(
      getReachableApplicationId({
        callingApplication: undefined,
        access: 'manage',
      }),
    ).toBeUndefined();
  });

  it.each(['read', 'trigger'] as const)(
    'should let the workspace custom application %s every application',
    (access) => {
      expect(
        getReachableApplicationId({
          callingApplication: workspaceCustomApplication,
          access,
          workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
        }),
      ).toBeUndefined();
    },
  );

  it('should let the workspace custom application manage its own application only', () => {
    expect(
      getReachableApplicationId({
        callingApplication: workspaceCustomApplication,
        access: 'manage',
      }),
    ).toBe(WORKSPACE_CUSTOM_APPLICATION_ID);
  });

  it('should keep an installed application to its own application', () => {
    expect(
      getReachableApplicationId({
        callingApplication: installedApplication,
        access: 'read',
        workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
      }),
    ).toBe(INSTALLED_APPLICATION_ID);
  });
});
