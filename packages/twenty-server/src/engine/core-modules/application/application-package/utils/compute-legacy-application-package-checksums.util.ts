import { createHash } from 'crypto';
import { isDefined } from 'twenty-shared/utils';

const computeMd5 = (content: string): string =>
  createHash('md5').update(content).digest('hex');

export const computeLegacyApplicationPackageChecksums = ({
  packageJsonContent,
  yarnLockContent,
}: {
  packageJsonContent: string;
  yarnLockContent: string | null;
}): { packageJsonChecksum: string; yarnLockChecksum: string | null } => ({
  packageJsonChecksum: computeMd5(packageJsonContent),
  yarnLockChecksum: isDefined(yarnLockContent)
    ? computeMd5(yarnLockContent)
    : null,
});
