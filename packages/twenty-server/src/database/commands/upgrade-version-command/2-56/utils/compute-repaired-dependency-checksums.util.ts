import { computeApplicationPackageChecksums } from 'src/engine/core-modules/application/application-package/utils/compute-application-package-checksums.util';
import { computeLegacyApplicationPackageChecksums } from 'src/engine/core-modules/application/application-package/utils/compute-legacy-application-package-checksums.util';
import {
  type DependencyChecksums,
  isMatchingDependencyChecksums,
} from 'src/engine/core-modules/application/application-package/utils/is-matching-dependency-checksums.util';

export const computeRepairedDependencyChecksums = ({
  declaredChecksums,
  packageJsonContent,
  yarnLockContent,
}: {
  declaredChecksums: DependencyChecksums;
  packageJsonContent: string;
  yarnLockContent: string | null;
}): DependencyChecksums | undefined => {
  const storedFilesChecksums = computeApplicationPackageChecksums({
    packageJsonContent,
    yarnLockContent,
  });

  const isDeclaredChecksumsAccepted = [
    storedFilesChecksums,
    computeLegacyApplicationPackageChecksums({
      packageJsonContent,
      yarnLockContent,
    }),
  ].some((filesChecksums) =>
    isMatchingDependencyChecksums({ declaredChecksums, filesChecksums }),
  );

  return isDeclaredChecksumsAccepted ? undefined : storedFilesChecksums;
};
