import { readFile } from 'fs/promises';
import path from 'path';

import { ASSET_PATH } from 'src/constants/assets-path';
import { parseAvailablePackagesFromPackageJsonAndYarnLock } from 'src/engine/core-modules/application/utils/parse-available-packages-from-package-json-and-yarn-lock.util';
import { logicFunctionCreateHash } from 'src/engine/metadata-modules/logic-function/utils/logic-function-create-hash.utils';

const DEFAULT_PACKAGE_FILES_DIR = path.join(
  ASSET_PATH,
  'engine/core-modules/application/constants/default-package-files',
);

export type DefaultApplicationPackageFields = {
  packageJsonChecksum: string;
  yarnLockChecksum: string;
  availablePackages: Record<string, string>;
  packageJsonContent: string;
  yarnLockContent: string;
};

let cachedDefaultApplicationPackageFields: DefaultApplicationPackageFields | null =
  null;

export const getDefaultApplicationPackageFields =
  async (): Promise<DefaultApplicationPackageFields> => {
    if (cachedDefaultApplicationPackageFields) {
      return cachedDefaultApplicationPackageFields;
    }

    const [packageJsonContent, yarnLockContent] = await Promise.all([
      readFile(path.join(DEFAULT_PACKAGE_FILES_DIR, 'package.json'), 'utf8'),
      readFile(path.join(DEFAULT_PACKAGE_FILES_DIR, 'yarn.lock'), 'utf8'),
    ]);

    const packageJsonChecksum = logicFunctionCreateHash(
      JSON.stringify(JSON.parse(packageJsonContent)),
    );
    const yarnLockChecksum = logicFunctionCreateHash(yarnLockContent);
    const availablePackages = parseAvailablePackagesFromPackageJsonAndYarnLock(
      packageJsonContent,
      yarnLockContent,
    );

    cachedDefaultApplicationPackageFields = {
      packageJsonChecksum,
      yarnLockChecksum,
      availablePackages,
      packageJsonContent,
      yarnLockContent,
    };

    return cachedDefaultApplicationPackageFields;
  };
