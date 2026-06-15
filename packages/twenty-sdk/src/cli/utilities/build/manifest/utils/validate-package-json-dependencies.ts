import { pathExists, readJson } from '@/cli/utilities/file/fs-utils';
import path from 'path';
import { isDefined } from 'twenty-shared/utils';

type PackageJsonDependencies = {
  dependencies?: Record<string, string>;
};

// Neither Twenty SDK package needs to be resolved by the published app at
// runtime, so both must live in "devDependencies":
// - twenty-sdk ships the CLI and build/scaffolding tooling used only at dev and
//   build time, and is never imported by the published app's runtime.
// - twenty-client-sdk is imported by app code but is provided at runtime by
//   Twenty's injected SDK (Lambda SDK layer / server-served modules), so the
//   app's installed copy is only needed for typecheck/build.
// Keeping either under "dependencies" pulls it into the Lambda deps layer.
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

  return Object.entries(BUILD_TIME_DEPENDENCY_WARNINGS)
    .filter(([packageName]) =>
      isDefined(packageJson.dependencies?.[packageName]),
    )
    .map(([, warning]) => warning);
};
