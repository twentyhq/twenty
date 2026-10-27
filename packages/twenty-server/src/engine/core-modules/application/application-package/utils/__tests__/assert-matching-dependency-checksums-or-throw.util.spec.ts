import { assertMatchingDependencyChecksumsOrThrow } from 'src/engine/core-modules/application/application-package/utils/assert-matching-dependency-checksums-or-throw.util';
import { computeApplicationPackageChecksums } from 'src/engine/core-modules/application/application-package/utils/compute-application-package-checksums.util';
import { computeLegacyApplicationPackageChecksums } from 'src/engine/core-modules/application/application-package/utils/compute-legacy-application-package-checksums.util';
import { ApplicationException } from 'src/engine/core-modules/application/application.exception';

const APPLICATION_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-00000000000a';

const STORED_FILES = {
  packageJsonContent: JSON.stringify({ name: 'test-app', version: '1.0.0' }),
  yarnLockContent: '# yarn lockfile v1\n',
};

const STORED_FILES_CHECKSUMS = computeApplicationPackageChecksums(STORED_FILES);

describe('assertMatchingDependencyChecksumsOrThrow', () => {
  it('returns the checksums of the stored files when the declared ones match', () => {
    expect(
      assertMatchingDependencyChecksumsOrThrow({
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        declaredChecksums: STORED_FILES_CHECKSUMS,
        ...STORED_FILES,
      }),
    ).toEqual(STORED_FILES_CHECKSUMS);
  });

  it('refuses a package.json checksum that does not describe the stored file', () => {
    expect(() =>
      assertMatchingDependencyChecksumsOrThrow({
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        declaredChecksums: {
          ...STORED_FILES_CHECKSUMS,
          packageJsonChecksum: 'other-package-json',
        },
        ...STORED_FILES,
      }),
    ).toThrow(ApplicationException);
  });

  it('refuses a yarn.lock checksum that does not describe the stored file', () => {
    expect(() =>
      assertMatchingDependencyChecksumsOrThrow({
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        declaredChecksums: {
          ...STORED_FILES_CHECKSUMS,
          yarnLockChecksum: 'other-yarn-lock',
        },
        ...STORED_FILES,
      }),
    ).toThrow(ApplicationException);
  });

  it('refuses a stored yarn.lock when no yarn.lock checksum is declared', () => {
    expect(() =>
      assertMatchingDependencyChecksumsOrThrow({
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        declaredChecksums: {
          ...STORED_FILES_CHECKSUMS,
          yarnLockChecksum: null,
        },
        ...STORED_FILES,
      }),
    ).toThrow(ApplicationException);
  });

  it('ignores the declared yarn.lock checksum when no yarn.lock is stored', () => {
    expect(
      assertMatchingDependencyChecksumsOrThrow({
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        declaredChecksums: {
          ...STORED_FILES_CHECKSUMS,
          yarnLockChecksum: 'declared-yarn-lock',
        },
        packageJsonContent: STORED_FILES.packageJsonContent,
        yarnLockContent: null,
      }),
    ).toEqual({ ...STORED_FILES_CHECKSUMS, yarnLockChecksum: null });
  });

  it('accepts the md5 checksums of older CLIs and returns the current ones', () => {
    expect(
      assertMatchingDependencyChecksumsOrThrow({
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        declaredChecksums:
          computeLegacyApplicationPackageChecksums(STORED_FILES),
        ...STORED_FILES,
      }),
    ).toEqual(STORED_FILES_CHECKSUMS);
  });

  it('refuses a pair that mixes both formulas', () => {
    expect(() =>
      assertMatchingDependencyChecksumsOrThrow({
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        declaredChecksums: {
          packageJsonChecksum: STORED_FILES_CHECKSUMS.packageJsonChecksum,
          yarnLockChecksum:
            computeLegacyApplicationPackageChecksums(STORED_FILES)
              .yarnLockChecksum,
        },
        ...STORED_FILES,
      }),
    ).toThrow(ApplicationException);
  });
});
