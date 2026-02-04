import { readFile } from 'fs/promises';
import path from 'path';

import { ASSET_PATH } from 'src/constants/assets-path';
import { parseAvailablePackagesFromPackageJsonAndYarnLock } from 'src/engine/core-modules/application/utils/parse-available-packages-from-package-json-and-yarn-lock.util';

const DEFAULT_PACKAGE_FILES_DIR = path.join(
  ASSET_PATH,
  'engine/core-modules/application/constants/default-package-files',
);

// To regenerate: use logicFunctionCreateHash from logic-function-create-hash.utils.
// package.json: hash(JSON.stringify(JSON.parse(content))). yarn.lock: hash(content).
// Both use first 32 chars of SHA512 hex digest.
const DEFAULT_PACKAGE_JSON_CHECKSUM = '84772134573e316a4eb1f9dc2e58706a';
const DEFAULT_YARN_LOCK_CHECKSUM = '8d837b7503cf8eff21c6446a126588d4';

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
      readFile(path.join(DEFAULT_PACKAGE_FILES_DIR, 'package.json'), 'utf8'),
      readFile(path.join(DEFAULT_PACKAGE_FILES_DIR, 'yarn.lock'), 'utf8'),
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
