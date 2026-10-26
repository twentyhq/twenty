import { readFile } from 'fs/promises';
import path from 'path';

import {
  computeDependencyFileChecksum,
  computePackageJsonChecksum,
} from 'twenty-shared/application';

import { parseAvailablePackagesFromPackageJsonAndYarnLock } from 'src/engine/core-modules/application/application-package/utils/parse-available-packages-from-package-json-and-yarn-lock.util';
import { SEED_DEPENDENCIES_DIRNAME } from 'src/engine/core-modules/application/application-package/constants/seed-dependencies-dirname';

export type DefaultApplicationPackageFields = {
  packageJsonChecksum: string;
  yarnLockChecksum: string;
  availablePackages: Record<string, string>;
  packageJsonContent: string;
  yarnLockContent: string;
};

export const getDefaultApplicationPackageFields = async ({
  directory = SEED_DEPENDENCIES_DIRNAME,
}: { directory?: string } = {}): Promise<DefaultApplicationPackageFields> => {
  const [packageJsonContent, yarnLockContent] = await Promise.all([
    readFile(path.join(directory, 'package.json'), 'utf8'),
    readFile(path.join(directory, 'yarn.lock'), 'utf8'),
  ]);

  const availablePackages = parseAvailablePackagesFromPackageJsonAndYarnLock(
    packageJsonContent,
    yarnLockContent,
  );

  return {
    packageJsonChecksum: computePackageJsonChecksum(packageJsonContent),
    yarnLockChecksum: computeDependencyFileChecksum(yarnLockContent),
    availablePackages,
    packageJsonContent,
    yarnLockContent,
  };
};
