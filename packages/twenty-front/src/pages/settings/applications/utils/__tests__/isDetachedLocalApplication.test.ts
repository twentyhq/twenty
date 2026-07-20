import { ApplicationRegistrationSourceType } from '~/generated-metadata/graphql';
import { isDetachedLocalApplication } from '~/pages/settings/applications/utils/isDetachedLocalApplication';

describe('isDetachedLocalApplication', () => {
  it('should be true when a local app is backed by an npm registration', () => {
    expect(
      isDetachedLocalApplication({
        applicationSourceType: ApplicationRegistrationSourceType.LOCAL,
        registrationSourceType: ApplicationRegistrationSourceType.NPM,
      }),
    ).toBe(true);
  });

  it('should be true when a local app is backed by a tarball registration', () => {
    expect(
      isDetachedLocalApplication({
        applicationSourceType: ApplicationRegistrationSourceType.LOCAL,
        registrationSourceType: ApplicationRegistrationSourceType.TARBALL,
      }),
    ).toBe(true);
  });

  it('should be false for a purely local app (local registration)', () => {
    expect(
      isDetachedLocalApplication({
        applicationSourceType: ApplicationRegistrationSourceType.LOCAL,
        registrationSourceType: ApplicationRegistrationSourceType.LOCAL,
      }),
    ).toBe(false);
  });

  it('should be false for a non-local (npm) installed app', () => {
    expect(
      isDetachedLocalApplication({
        applicationSourceType: ApplicationRegistrationSourceType.NPM,
        registrationSourceType: ApplicationRegistrationSourceType.NPM,
      }),
    ).toBe(false);
  });

  it('should be false when source types are missing', () => {
    expect(
      isDetachedLocalApplication({
        applicationSourceType: undefined,
        registrationSourceType: null,
      }),
    ).toBe(false);
  });
});
