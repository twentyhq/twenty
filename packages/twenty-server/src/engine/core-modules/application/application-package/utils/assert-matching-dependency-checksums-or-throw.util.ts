import { isDefined } from 'twenty-shared/utils';

import { computeApplicationPackageChecksums } from 'src/engine/core-modules/application/application-package/utils/compute-application-package-checksums.util';
import { computeLegacyApplicationPackageChecksums } from 'src/engine/core-modules/application/application-package/utils/compute-legacy-application-package-checksums.util';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';

export type DependencyChecksums = {
  packageJsonChecksum: string | null;
  yarnLockChecksum: string | null;
};

const isMatchingDependencyChecksums = ({
  declaredChecksums,
  storedFilesChecksums,
}: {
  declaredChecksums: DependencyChecksums;
  storedFilesChecksums: DependencyChecksums;
}): boolean =>
  storedFilesChecksums.packageJsonChecksum ===
    declaredChecksums.packageJsonChecksum &&
  (!isDefined(storedFilesChecksums.yarnLockChecksum) ||
    storedFilesChecksums.yarnLockChecksum ===
      declaredChecksums.yarnLockChecksum);

export const assertMatchingDependencyChecksumsOrThrow = ({
  applicationUniversalIdentifier,
  declaredChecksums,
  packageJsonContent,
  yarnLockContent,
}: {
  applicationUniversalIdentifier: string;
  declaredChecksums: DependencyChecksums;
  packageJsonContent: string;
  yarnLockContent: string | null;
}): { packageJsonChecksum: string; yarnLockChecksum: string | null } => {
  const storedFilesChecksums = computeApplicationPackageChecksums({
    packageJsonContent,
    yarnLockContent,
  });

  const acceptedStoredFilesChecksums = [
    storedFilesChecksums,
    computeLegacyApplicationPackageChecksums({
      packageJsonContent,
      yarnLockContent,
    }),
  ];

  const isMatching = acceptedStoredFilesChecksums.some((acceptedChecksums) =>
    isMatchingDependencyChecksums({
      declaredChecksums,
      storedFilesChecksums: acceptedChecksums,
    }),
  );

  if (!isMatching) {
    throw new ApplicationException(
      `Stored dependency files do not match the declared checksums of application ${applicationUniversalIdentifier}`,
      ApplicationExceptionCode.INVALID_INPUT,
    );
  }

  return storedFilesChecksums;
};
