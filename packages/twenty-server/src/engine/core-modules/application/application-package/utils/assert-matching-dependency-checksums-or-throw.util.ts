import { isDefined } from 'twenty-shared/utils';

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
  storedFilesChecksums,
  legacyStoredFilesChecksums,
}: {
  applicationUniversalIdentifier: string;
  declaredChecksums: DependencyChecksums;
  storedFilesChecksums: DependencyChecksums;
  legacyStoredFilesChecksums: DependencyChecksums;
}): void => {
  const isMatching = [storedFilesChecksums, legacyStoredFilesChecksums].some(
    (acceptedChecksums) =>
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
};
