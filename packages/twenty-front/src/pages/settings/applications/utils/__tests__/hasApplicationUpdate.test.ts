import { ApplicationRegistrationSourceType } from '~/generated-metadata/graphql';
import { hasApplicationUpdate } from '~/pages/settings/applications/utils/hasApplicationUpdate';

describe('hasApplicationUpdate', () => {
  it.each([
    ApplicationRegistrationSourceType.NPM,
    ApplicationRegistrationSourceType.TARBALL,
  ])(
    'reports an update for a %s app behind its latest version',
    (sourceType) => {
      expect(
        hasApplicationUpdate({
          sourceType,
          currentVersion: '0.1.0',
          latestAvailableVersion: '0.2.0',
        }),
      ).toBe(true);
    },
  );

  it.each([
    ApplicationRegistrationSourceType.LOCAL,
    ApplicationRegistrationSourceType.OAUTH_ONLY,
    undefined,
  ])('never reports an update for a %s app', (sourceType) => {
    expect(
      hasApplicationUpdate({
        sourceType,
        currentVersion: '0.1.0',
        latestAvailableVersion: '0.2.0',
      }),
    ).toBe(false);
  });

  it('reports no update when the app is already on the latest version', () => {
    expect(
      hasApplicationUpdate({
        sourceType: ApplicationRegistrationSourceType.TARBALL,
        currentVersion: '0.2.0',
        latestAvailableVersion: '0.2.0',
      }),
    ).toBe(false);
  });

  it('reports no update when either version is unknown', () => {
    expect(
      hasApplicationUpdate({
        sourceType: ApplicationRegistrationSourceType.TARBALL,
        currentVersion: null,
        latestAvailableVersion: '0.2.0',
      }),
    ).toBe(false);
    expect(
      hasApplicationUpdate({
        sourceType: ApplicationRegistrationSourceType.TARBALL,
        currentVersion: '0.1.0',
        latestAvailableVersion: null,
      }),
    ).toBe(false);
  });
});
