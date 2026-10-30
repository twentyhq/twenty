import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { getReachableApplications } from 'src/engine/core-modules/application/utils/get-reachable-applications.util';

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

describe('getReachableApplications', () => {
  it('should reach every application without a calling application', () => {
    expect(
      getReachableApplications({
        callingApplication: undefined,
        access: 'manage',
      }),
    ).toEqual({ type: 'all' });
  });

  it.each(['read', 'trigger'] as const)(
    'should let the workspace custom application %s every application',
    (access) => {
      expect(
        getReachableApplications({
          callingApplication: workspaceCustomApplication,
          access,
          workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
        }),
      ).toEqual({ type: 'all' });
    },
  );

  it('should let the workspace custom application manage its own application only', () => {
    expect(
      getReachableApplications({
        callingApplication: workspaceCustomApplication,
        access: 'manage',
      }),
    ).toEqual({
      type: 'own',
      applicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
    });
  });

  it('should keep an installed application to its own application', () => {
    expect(
      getReachableApplications({
        callingApplication: installedApplication,
        access: 'read',
        workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
      }),
    ).toEqual({
      type: 'own',
      applicationId: INSTALLED_APPLICATION_ID,
    });
  });
});
