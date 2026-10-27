import { logicFunctionCreateHash } from 'src/engine/metadata-modules/logic-function/utils/logic-function-create-hash.utils';
import { readFile } from 'fs/promises';
import path from 'path';

import { parseAvailablePackagesFromPackageJsonAndYarnLock } from 'src/engine/core-modules/application/application-package/utils/parse-available-packages-from-package-json-and-yarn-lock.util';
import { STANDARD_APPLICATION_DEPENDENCIES_DIRECTORY_NAME } from 'src/engine/core-modules/application/application-package/constants/standard-application-dependencies-directory-name';

export type DefaultApplicationPackageFields = {
  packageJsonChecksum: string;
  yarnLockChecksum: string;
  availablePackages: Record<string, string>;
  packageJsonContent: string;
  yarnLockContent: string;
};

export const getDefaultApplicationPackageFields = async ({
  directory = STANDARD_APPLICATION_DEPENDENCIES_DIRECTORY_NAME,
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
    packageJsonChecksum: logicFunctionCreateHash(
      JSON.stringify(JSON.parse(packageJsonContent)),
    ),
    yarnLockChecksum: logicFunctionCreateHash(yarnLockContent),
    availablePackages,
    packageJsonContent,
    yarnLockContent,
  };
};
