import { AppManifest, PackageJson } from '../types/config.types';
import { parseJsoncFile, parseTextFile } from './jsonc-parser';
import { loadManifestFromDecorators } from '../utils/load-manifest-from-decorators';
import { findPathFile } from '../utils/find-path-file';
import { loadEnvVariables } from '../utils/load-env-variables';
import { mergeEnvVariables } from '../utils/merge-env-variables';

export const loadManifest = async (
  appPath: string,
): Promise<{
  packageJson: PackageJson;
  yarnLock: string;
  manifest: AppManifest;
}> => {
  const packageJson = await parseJsoncFile(
    await findPathFile(appPath, 'package.json'),
  );

  const rawYarnLock = await parseTextFile(
    await findPathFile(appPath, 'yarn.lock'),
  );

  const manifestFromDecorators = await loadManifestFromDecorators();

  const envVariables = await loadEnvVariables(appPath);

  const variables = mergeEnvVariables({
    envVariablesFromDecorators: manifestFromDecorators.applicationVariables,
    envVariablesFromDotEnv: envVariables,
  });

  return {
    packageJson,
    yarnLock: rawYarnLock,
    manifest: {
      application: manifestFromDecorators.application,
      serverlessFunctions: manifestFromDecorators.serverlessFunctions,
      objects: manifestFromDecorators.objects,
      applicationVariables: variables,
      sources: manifestFromDecorators.sources,
    },
  };
};
