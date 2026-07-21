import { ApplicationRegistrationSourceType } from '~/generated-metadata/graphql';
import { getApplicationHasUpdate } from '~/pages/settings/applications/utils/getApplicationHasUpdate';

describe('getApplicationHasUpdate', () => {
  it('should offer an update for a detached local app on a published registration', () => {
    expect(
      getApplicationHasUpdate({
        applicationSourceType: ApplicationRegistrationSourceType.LOCAL,
        registrationSourceType: ApplicationRegistrationSourceType.NPM,
        currentVersion: '1.2.3',
        latestAvailableVersion: '1.2.3',
      }),
    ).toBe(true);
  });

  it('should offer an update when a strictly newer version is available', () => {
    expect(
      getApplicationHasUpdate({
        applicationSourceType: ApplicationRegistrationSourceType.NPM,
        registrationSourceType: ApplicationRegistrationSourceType.NPM,
        currentVersion: '1.2.3',
        latestAvailableVersion: '1.3.0',
      }),
    ).toBe(true);
  });

  it('should not offer an update for a non-local app already on the latest version', () => {
    expect(
      getApplicationHasUpdate({
        applicationSourceType: ApplicationRegistrationSourceType.NPM,
        registrationSourceType: ApplicationRegistrationSourceType.NPM,
        currentVersion: '1.2.3',
        latestAvailableVersion: '1.2.3',
      }),
    ).toBe(false);
  });

  it('should not offer an update when the registration is local', () => {
    expect(
      getApplicationHasUpdate({
        applicationSourceType: ApplicationRegistrationSourceType.LOCAL,
        registrationSourceType: ApplicationRegistrationSourceType.LOCAL,
        currentVersion: '1.2.3',
        latestAvailableVersion: '1.2.3',
      }),
    ).toBe(false);
  });

  it('should not offer an update without a latest available version', () => {
    expect(
      getApplicationHasUpdate({
        applicationSourceType: ApplicationRegistrationSourceType.LOCAL,
        registrationSourceType: ApplicationRegistrationSourceType.NPM,
        currentVersion: '1.2.3',
        latestAvailableVersion: null,
      }),
    ).toBe(false);
  });
});
