import {
  computeDependencyFileChecksum,
  computePackageJsonChecksum,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

export const computeApplicationPackageChecksums = ({
  packageJsonContent,
  yarnLockContent,
}: {
  packageJsonContent: string;
  yarnLockContent: string | null;
}): { packageJsonChecksum: string; yarnLockChecksum: string | null } => ({
  packageJsonChecksum: computePackageJsonChecksum(packageJsonContent),
  yarnLockChecksum: isDefined(yarnLockContent)
    ? computeDependencyFileChecksum(yarnLockContent)
    : null,
});
