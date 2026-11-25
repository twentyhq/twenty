import { computeRepairedDependencyChecksums } from 'src/database/commands/upgrade-version-command/2-56/utils/compute-repaired-dependency-checksums.util';
import { computeApplicationPackageChecksums } from 'src/engine/core-modules/application/application-package/utils/compute-application-package-checksums.util';
import { computeLegacyApplicationPackageChecksums } from 'src/engine/core-modules/application/application-package/utils/compute-legacy-application-package-checksums.util';

const PACKAGE_JSON_CONTENT = '{\n  "name": "app",\n  "version": "1.0.0"\n}\n';
const YARN_LOCK_CONTENT = '__metadata:\n  version: 8\n';

const STORED_FILES_CHECKSUMS = computeApplicationPackageChecksums({
  packageJsonContent: PACKAGE_JSON_CONTENT,
  yarnLockContent: YARN_LOCK_CONTENT,
});

describe('computeRepairedDependencyChecksums', () => {
  it('returns undefined when the declared checksums match the stored files', () => {
    expect(
      computeRepairedDependencyChecksums({
        declaredChecksums: STORED_FILES_CHECKSUMS,
        packageJsonContent: PACKAGE_JSON_CONTENT,
        yarnLockContent: YARN_LOCK_CONTENT,
      }),
    ).toBeUndefined();
  });

  it('returns undefined when the declared checksums match the legacy md5 of the stored files', () => {
    expect(
      computeRepairedDependencyChecksums({
        declaredChecksums: computeLegacyApplicationPackageChecksums({
          packageJsonContent: PACKAGE_JSON_CONTENT,
          yarnLockContent: YARN_LOCK_CONTENT,
        }),
        packageJsonContent: PACKAGE_JSON_CONTENT,
        yarnLockContent: YARN_LOCK_CONTENT,
      }),
    ).toBeUndefined();
  });

  it('returns undefined when no yarn.lock is stored and package.json matches', () => {
    expect(
      computeRepairedDependencyChecksums({
        declaredChecksums: {
          packageJsonChecksum: STORED_FILES_CHECKSUMS.packageJsonChecksum,
          yarnLockChecksum: 'stale-yarn-lock-checksum',
        },
        packageJsonContent: PACKAGE_JSON_CONTENT,
        yarnLockContent: null,
      }),
    ).toBeUndefined();
  });

  it('returns the stored files checksums when the yarn.lock checksum is stale', () => {
    expect(
      computeRepairedDependencyChecksums({
        declaredChecksums: {
          packageJsonChecksum: STORED_FILES_CHECKSUMS.packageJsonChecksum,
          yarnLockChecksum: 'stale-yarn-lock-checksum',
        },
        packageJsonContent: PACKAGE_JSON_CONTENT,
        yarnLockContent: YARN_LOCK_CONTENT,
      }),
    ).toEqual(STORED_FILES_CHECKSUMS);
  });

  it('returns the stored files checksums when a yarn.lock is stored but none is declared', () => {
    expect(
      computeRepairedDependencyChecksums({
        declaredChecksums: {
          packageJsonChecksum: STORED_FILES_CHECKSUMS.packageJsonChecksum,
          yarnLockChecksum: null,
        },
        packageJsonContent: PACKAGE_JSON_CONTENT,
        yarnLockContent: YARN_LOCK_CONTENT,
      }),
    ).toEqual(STORED_FILES_CHECKSUMS);
  });

  it('returns the stored files checksums with a null yarn.lock checksum when package.json is stale and no yarn.lock is stored', () => {
    expect(
      computeRepairedDependencyChecksums({
        declaredChecksums: {
          packageJsonChecksum: 'stale-package-json-checksum',
          yarnLockChecksum: 'stale-yarn-lock-checksum',
        },
        packageJsonContent: PACKAGE_JSON_CONTENT,
        yarnLockContent: null,
      }),
    ).toEqual({
      packageJsonChecksum: STORED_FILES_CHECKSUMS.packageJsonChecksum,
      yarnLockChecksum: null,
    });
  });
});
