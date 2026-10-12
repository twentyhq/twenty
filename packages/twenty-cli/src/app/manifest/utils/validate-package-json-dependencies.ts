import { pathExists, readJson } from '@/app/fs-utils';
import path from 'path';
import { isDefined } from 'twenty-shared/utils';

type PackageJsonDependencies = {
  dependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
};

// SDK authoring code is handled by the build, and Twenty supplies the client SDK
// at runtime. Listing either as a dependency adds it to the Lambda deps layer.
const BUILD_TIME_DEPENDENCY_WARNINGS: Record<string, string> = {
  'twenty-sdk':
    '"twenty-sdk" is listed under "dependencies" in package.json. It is a build-time only tool and should be moved to "devDependencies".',
  'twenty-client-sdk':
    '"twenty-client-sdk" is listed under "dependencies" in package.json. It is provided at runtime by Twenty\'s injected SDK and should be moved to "devDependencies".',
};

export const validatePackageJsonDependencies = async (
  appPath: string,
): Promise<string[]> => {
  const packageJsonPath = path.join(appPath, 'package.json');

  if (!(await pathExists(packageJsonPath))) {
    return [];
  }

  const packageJson = await readJson<PackageJsonDependencies>(packageJsonPath);

  return (['dependencies', 'optionalDependencies'] as const).flatMap(
    (section) =>
      Object.entries(BUILD_TIME_DEPENDENCY_WARNINGS)
        .filter(([packageName]) =>
          isDefined(packageJson[section]?.[packageName]),
        )
        .map(([, warning]) =>
          warning.replace('"dependencies"', `"${section}"`),
        ),
  );
};
