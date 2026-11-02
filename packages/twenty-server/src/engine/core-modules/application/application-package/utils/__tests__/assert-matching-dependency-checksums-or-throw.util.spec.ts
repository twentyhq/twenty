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

const LEGACY_STORED_FILES_CHECKSUMS =
  computeLegacyApplicationPackageChecksums(STORED_FILES);

const STORED_CHECKSUMS = {
  storedFilesChecksums: STORED_FILES_CHECKSUMS,
  legacyStoredFilesChecksums: LEGACY_STORED_FILES_CHECKSUMS,
};

describe('assertMatchingDependencyChecksumsOrThrow', () => {
  it('accepts declared checksums that describe the stored files', () => {
    expect(() =>
      assertMatchingDependencyChecksumsOrThrow({
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        declaredChecksums: STORED_FILES_CHECKSUMS,
        ...STORED_CHECKSUMS,
      }),
    ).not.toThrow();
  });

  it('refuses a package.json checksum that does not describe the stored file', () => {
    expect(() =>
      assertMatchingDependencyChecksumsOrThrow({
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        declaredChecksums: {
          ...STORED_FILES_CHECKSUMS,
          packageJsonChecksum: 'other-package-json',
        },
        ...STORED_CHECKSUMS,
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
        ...STORED_CHECKSUMS,
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
        ...STORED_CHECKSUMS,
      }),
    ).toThrow(ApplicationException);
  });

  it('ignores the declared yarn.lock checksum when no yarn.lock is stored', () => {
    const storedFilesWithoutYarnLock = {
      packageJsonContent: STORED_FILES.packageJsonContent,
      yarnLockContent: null,
    };

    expect(() =>
      assertMatchingDependencyChecksumsOrThrow({
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        declaredChecksums: {
          ...STORED_FILES_CHECKSUMS,
          yarnLockChecksum: 'declared-yarn-lock',
        },
        storedFilesChecksums: computeApplicationPackageChecksums(
          storedFilesWithoutYarnLock,
        ),
        legacyStoredFilesChecksums: computeLegacyApplicationPackageChecksums(
          storedFilesWithoutYarnLock,
        ),
      }),
    ).not.toThrow();
  });

  it('accepts the md5 checksums of older CLIs', () => {
    expect(() =>
      assertMatchingDependencyChecksumsOrThrow({
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        declaredChecksums: LEGACY_STORED_FILES_CHECKSUMS,
        ...STORED_CHECKSUMS,
      }),
    ).not.toThrow();
  });

  it('refuses a pair that mixes both formulas', () => {
    expect(() =>
      assertMatchingDependencyChecksumsOrThrow({
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        declaredChecksums: {
          packageJsonChecksum: STORED_FILES_CHECKSUMS.packageJsonChecksum,
          yarnLockChecksum: LEGACY_STORED_FILES_CHECKSUMS.yarnLockChecksum,
        },
        ...STORED_CHECKSUMS,
      }),
    ).toThrow(ApplicationException);
  });
});
