import { isDefined } from 'twenty-shared/utils';

export type DependencyChecksums = {
  packageJsonChecksum: string | null;
  yarnLockChecksum: string | null;
};

export const isMatchingDependencyChecksums = ({
  declaredChecksums,
  filesChecksums,
}: {
  declaredChecksums: DependencyChecksums;
  filesChecksums: DependencyChecksums;
}): boolean =>
  filesChecksums.packageJsonChecksum ===
    declaredChecksums.packageJsonChecksum &&
  (!isDefined(filesChecksums.yarnLockChecksum) ||
    filesChecksums.yarnLockChecksum === declaredChecksums.yarnLockChecksum);
