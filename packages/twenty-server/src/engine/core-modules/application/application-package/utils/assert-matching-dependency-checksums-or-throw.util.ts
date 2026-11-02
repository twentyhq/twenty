import {
  type DependencyChecksums,
  isMatchingDependencyChecksums,
} from 'src/engine/core-modules/application/application-package/utils/is-matching-dependency-checksums.util';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';

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
    (filesChecksums) =>
      isMatchingDependencyChecksums({ declaredChecksums, filesChecksums }),
  );

  if (!isMatching) {
    throw new ApplicationException(
      `Stored dependency files do not match the declared checksums of application ${applicationUniversalIdentifier}`,
      ApplicationExceptionCode.INVALID_INPUT,
    );
  }
};
