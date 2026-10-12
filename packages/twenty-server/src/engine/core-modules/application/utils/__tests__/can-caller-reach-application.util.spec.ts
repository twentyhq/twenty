import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { canCallerReachApplication } from 'src/engine/core-modules/application/utils/can-caller-reach-application.util';

const CALLING_APPLICATION_ID = 'b1a4c0d2-6e1f-4a6b-9c1d-0f2e3a4b5c6d';

const OTHER_APPLICATION_ID = 'e5f6a7b8-c9d0-4e1f-a2b3-c4d5e6f7a8b9';

describe('canCallerReachApplication', () => {
  describe.each([
    ApplicationRegistrationSourceType.LOCAL,
    ApplicationRegistrationSourceType.NPM,
    ApplicationRegistrationSourceType.TARBALL,
  ])('with a %s application caller', (sourceType) => {
    const callingApplication = { id: CALLING_APPLICATION_ID, sourceType };

    it('should reach its own application', () => {
      expect(
        canCallerReachApplication({
          callingApplication,
          applicationId: CALLING_APPLICATION_ID,
        }),
      ).toBe(true);
    });

    it('should not reach another application', () => {
      expect(
        canCallerReachApplication({
          callingApplication,
          applicationId: OTHER_APPLICATION_ID,
        }),
      ).toBe(false);
    });
  });

  it('should let an OAuth-only application caller reach another application', () => {
    expect(
      canCallerReachApplication({
        callingApplication: {
          id: CALLING_APPLICATION_ID,
          sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
        },
        applicationId: OTHER_APPLICATION_ID,
      }),
    ).toBe(true);
  });

  it('should let a caller without an application reach any application', () => {
    expect(
      canCallerReachApplication({
        callingApplication: undefined,
        applicationId: OTHER_APPLICATION_ID,
      }),
    ).toBe(true);
  });
});
