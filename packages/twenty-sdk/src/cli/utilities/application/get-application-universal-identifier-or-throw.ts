import {
  APP_CONFIG_CANDIDATE_PATHS,
  findAppConfigPath,
} from '@/cli/utilities/application/find-app-config-path';
import { extractManifestFromFile } from '@/cli/utilities/build/manifest/manifest-extract-config-from-file';

type ApplicationConfigWithUniversalIdentifier = {
  universalIdentifier?: string;
};

// Scaffolding derives deterministic identifiers from the application
// universal identifier, so nothing can be generated before defineApplication
// declares one.
export const getApplicationUniversalIdentifierOrThrow = async (
  appPath: string,
): Promise<string> => {
  const configPath = await findAppConfigPath(appPath);

  if (configPath === null) {
    throw new Error(
      `Could not find the application config file (expected one of: ${APP_CONFIG_CANDIDATE_PATHS.join(', ')}). Create it with defineApplication({ universalIdentifier: ... }) before generating entities.`,
    );
  }

  const { config } =
    await extractManifestFromFile<ApplicationConfigWithUniversalIdentifier>({
      appPath,
      filePath: configPath,
    });

  if (!config?.universalIdentifier) {
    throw new Error(
      `defineApplication in ${configPath} must declare a universalIdentifier before generating entities.`,
    );
  }

  return config.universalIdentifier;
};
