import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { buildApplicationManifestResourcePath } from 'src/engine/core-modules/application/application-registration/utils/build-application-manifest-resource-path.util';

describe('buildApplicationManifestResourcePath', () => {
  const applicationRegistrationId = 'a3d8e9f0-1234-4b5c-8d6e-7f8a9b0c1d2e';

  it('should build a versioned path when a version is provided', () => {
    const path = buildApplicationManifestResourcePath({
      applicationRegistrationId,
      sourceType: ApplicationRegistrationSourceType.NPM,
      version: '1.2.3',
      serializedManifest: '{}',
    });

    expect(path).toBe(`${applicationRegistrationId}/manifests/1.2.3.json`);
  });

  it('should keep prerelease and build metadata in the file name', () => {
    const path = buildApplicationManifestResourcePath({
      applicationRegistrationId,
      sourceType: ApplicationRegistrationSourceType.TARBALL,
      version: '2.0.0-beta.1+build42',
      serializedManifest: '{}',
    });

    expect(path).toBe(
      `${applicationRegistrationId}/manifests/2.0.0-beta.1+build42.json`,
    );
  });

  it('should build a dev path for LOCAL source type even when a version is provided', () => {
    const path = buildApplicationManifestResourcePath({
      applicationRegistrationId,
      sourceType: ApplicationRegistrationSourceType.LOCAL,
      version: '1.2.3',
      serializedManifest: '{}',
    });

    expect(path).toBe(`${applicationRegistrationId}/manifests/dev.json`);
  });

  it('should fall back to a content hash when version is missing', () => {
    const path = buildApplicationManifestResourcePath({
      applicationRegistrationId,
      sourceType: ApplicationRegistrationSourceType.NPM,
      version: null,
      serializedManifest: '{"application":{}}',
    });

    expect(path).toMatch(
      new RegExp(
        `^${applicationRegistrationId}/manifests/[0-9a-f]{16}\\.json$`,
      ),
    );
  });

  it('should produce the same hashed path for the same manifest content', () => {
    const buildPath = () =>
      buildApplicationManifestResourcePath({
        applicationRegistrationId,
        sourceType: ApplicationRegistrationSourceType.TARBALL,
        serializedManifest: '{"application":{"displayName":"App"}}',
      });

    expect(buildPath()).toBe(buildPath());
  });

  it.each([
    ['../../../etc/passwd'],
    ['..'],
    ['1.0.0/../secret'],
    ['a\\b'],
    ['.hidden'],
    [''],
  ])(
    'should fall back to a content hash when version %p is not filename-safe',
    (unsafeVersion) => {
      const path = buildApplicationManifestResourcePath({
        applicationRegistrationId,
        sourceType: ApplicationRegistrationSourceType.NPM,
        version: unsafeVersion,
        serializedManifest: '{}',
      });

      expect(path).toMatch(
        new RegExp(
          `^${applicationRegistrationId}/manifests/[0-9a-f]{16}\\.json$`,
        ),
      );
    },
  );
});
