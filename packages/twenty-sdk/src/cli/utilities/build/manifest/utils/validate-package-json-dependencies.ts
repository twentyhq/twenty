import { pathExists, readJson } from '@/cli/utilities/file/fs-utils';
import path from 'path';
import { isDefined } from 'twenty-shared/utils';

type PackageJsonDependencies = {
  dependencies?: Record<string, string>;
};

// twenty-sdk ships the CLI and build/scaffolding tooling used only at dev and
// build time — it is never imported by the published app's runtime. Keeping it
// in "dependencies" ships dead weight, so it must live in "devDependencies".
export const validatePackageJsonDependencies = async (
  appPath: string,
): Promise<string[]> => {
  const packageJsonPath = path.join(appPath, 'package.json');

  if (!(await pathExists(packageJsonPath))) {
    return [];
  }

  const packageJson = await readJson<PackageJsonDependencies>(packageJsonPath);

  if (isDefined(packageJson.dependencies?.['twenty-sdk'])) {
    return [
      '"twenty-sdk" is listed under "dependencies" in package.json. It is a build-time only tool and should be moved to "devDependencies".',
    ];
  }

  return [];
};
