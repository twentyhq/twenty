import { readFile } from 'fs/promises';
import path from 'path';

import { parseAvailablePackagesFromPackageJsonAndYarnLock } from 'src/engine/core-modules/application-layer/utils/parse-available-packages-from-package-json-and-yarn-lock.util';
import { SEED_DEPENDENCIES_DIRNAME } from 'src/engine/core-modules/application-layer/constants/seed-dependencies-dirname';

// To regenerate: use logicFunctionCreateHash from logic-function-create-hash.utils.
// package.json: hash(JSON.stringify(JSON.parse(content))). yarn.lock: hash(content).
// Both use first 32 chars of SHA512 hex digest.
const DEFAULT_PACKAGE_JSON_CHECKSUM = '4cf57bd317cfe8e49c47b0aa76aabb39';
const DEFAULT_YARN_LOCK_CHECKSUM = 'c160582cf017853b6340d3defec4e6ec';

export type DefaultApplicationPackageFields = {
  packageJsonChecksum: string;
  yarnLockChecksum: string;
  availablePackages: Record<string, string>;
  packageJsonContent: string;
  yarnLockContent: string;
};

export const getDefaultApplicationPackageFields =
  async (): Promise<DefaultApplicationPackageFields> => {
    const [packageJsonContent, yarnLockContent] = await Promise.all([
      readFile(path.join(SEED_DEPENDENCIES_DIRNAME, 'package.json'), 'utf8'),
      readFile(path.join(SEED_DEPENDENCIES_DIRNAME, 'yarn.lock'), 'utf8'),
    ]);

    const availablePackages = parseAvailablePackagesFromPackageJsonAndYarnLock(
      packageJsonContent,
      yarnLockContent,
    );

    return {
      packageJsonChecksum: DEFAULT_PACKAGE_JSON_CHECKSUM,
      yarnLockChecksum: DEFAULT_YARN_LOCK_CHECKSUM,
      availablePackages,
      packageJsonContent,
      yarnLockContent,
    };
  };
