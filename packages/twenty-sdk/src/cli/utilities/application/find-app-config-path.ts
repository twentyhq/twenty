import { join } from 'path';

import { pathExists } from '@/cli/utilities/file/fs-utils';

export const APP_CONFIG_CANDIDATE_PATHS = [
  'src/application.config.ts',
  'src/application-config.ts',
  'src/applicationConfig.ts',
];

export const findAppConfigPath = async (
  projectRoot: string,
): Promise<string | null> => {
  for (const candidate of APP_CONFIG_CANDIDATE_PATHS) {
    const absolute = join(projectRoot, candidate);

    if (await pathExists(absolute)) {
      return absolute;
    }
  }

  return null;
};
