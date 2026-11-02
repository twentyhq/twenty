import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { canCallerReachApplication } from 'src/engine/core-modules/application/utils/can-caller-reach-application.util';

const CALLING_APPLICATION_ID = 'b1a4c0d2-6e1f-4a6b-9c1d-0f2e3a4b5c6d';

const OTHER_APPLICATION_ID = 'e5f6a7b8-c9d0-4e1f-a2b3-c4d5e6f7a8b9';

const WORKSPACE_CUSTOM_APPLICATION_ID = 'c3d4e5f6-a7b8-4c9d-8e0f-1a2b3c4d5e6f';

const STANDARD_APPLICATION_ID = 'd4e5f6a7-b8c9-4d0e-9f1a-2b3c4d5e6f7a';

describe('canCallerReachApplication', () => {
  describe.each([
    ApplicationRegistrationSourceType.LOCAL,
    ApplicationRegistrationSourceType.NPM,
    ApplicationRegistrationSourceType.TARBALL,
  ])('with an installed %s application caller', (sourceType) => {
    const callingApplication = {
      id: CALLING_APPLICATION_ID,
      universalIdentifier: CALLING_APPLICATION_ID,
      sourceType,
    };

    it.each(['read', 'trigger'] as const)(
      'should %s its own application only',
      (operation) => {
        expect(
          canCallerReachApplication({
            callingApplication,
            applicationId: CALLING_APPLICATION_ID,
            operation,
            workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
          }),
        ).toBe(true);
        expect(
          canCallerReachApplication({
            callingApplication,
            applicationId: OTHER_APPLICATION_ID,
            operation,
            workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
          }),
        ).toBe(false);
      },
    );

    it('should manage its own application only', () => {
      expect(
        canCallerReachApplication({
          callingApplication,
          applicationId: CALLING_APPLICATION_ID,
          operation: 'manage',
        }),
      ).toBe(true);
      expect(
        canCallerReachApplication({
          callingApplication,
          applicationId: OTHER_APPLICATION_ID,
          operation: 'manage',
        }),
      ).toBe(false);
    });
  });

  describe('with the workspace custom application as caller', () => {
    const callingApplication = {
      id: WORKSPACE_CUSTOM_APPLICATION_ID,
      universalIdentifier: WORKSPACE_CUSTOM_APPLICATION_ID,
      sourceType: ApplicationRegistrationSourceType.LOCAL,
    };

    it.each(['read', 'trigger'] as const)(
      'should %s another application',
      (operation) => {
        expect(
          canCallerReachApplication({
            callingApplication,
            applicationId: OTHER_APPLICATION_ID,
            operation,
            workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
          }),
        ).toBe(true);
      },
    );

    it('should manage its own application only', () => {
      expect(
        canCallerReachApplication({
          callingApplication,
          applicationId: callingApplication.id,
          operation: 'manage',
        }),
      ).toBe(true);
      expect(
        canCallerReachApplication({
          callingApplication,
          applicationId: OTHER_APPLICATION_ID,
          operation: 'manage',
        }),
      ).toBe(false);
    });
  });

  it.each(['read', 'trigger'] as const)(
    'should let the standard application %s its own application only',
    (operation) => {
      const callingApplication = {
        id: STANDARD_APPLICATION_ID,
        universalIdentifier: TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
        sourceType: ApplicationRegistrationSourceType.LOCAL,
      };

      expect(
        canCallerReachApplication({
          callingApplication,
          applicationId: STANDARD_APPLICATION_ID,
          operation,
          workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
        }),
      ).toBe(true);
      expect(
        canCallerReachApplication({
          callingApplication,
          applicationId: OTHER_APPLICATION_ID,
          operation,
          workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
        }),
      ).toBe(false);
    },
  );

  it("should confine the workspace custom application when the workspace's custom application is unknown", () => {
    expect(
      canCallerReachApplication({
        callingApplication: {
          id: WORKSPACE_CUSTOM_APPLICATION_ID,
          universalIdentifier: WORKSPACE_CUSTOM_APPLICATION_ID,
          sourceType: ApplicationRegistrationSourceType.LOCAL,
        },
        applicationId: OTHER_APPLICATION_ID,
        operation: 'read',
        workspaceCustomApplicationId: undefined,
      }),
    ).toBe(false);
  });

  it('should let an OAuth-only application caller reach another application', () => {
    expect(
      canCallerReachApplication({
        callingApplication: {
          id: CALLING_APPLICATION_ID,
          universalIdentifier: CALLING_APPLICATION_ID,
          sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
        },
        applicationId: OTHER_APPLICATION_ID,
        operation: 'manage',
      }),
    ).toBe(true);
  });

  it('should let a caller without an application reach any application', () => {
    expect(
      canCallerReachApplication({
        callingApplication: undefined,
        applicationId: OTHER_APPLICATION_ID,
        operation: 'manage',
      }),
    ).toBe(true);
  });
});
