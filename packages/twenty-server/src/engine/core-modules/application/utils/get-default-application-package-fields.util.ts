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
const DEFAULT_PACKAGE_JSON_CHECKSUM = '1eee7f7ff908b69946b4c21ac46c5501';
const DEFAULT_YARN_LOCK_CHECKSUM = '5f06373a2a3e30d4a5c23e77f94129b1';

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
