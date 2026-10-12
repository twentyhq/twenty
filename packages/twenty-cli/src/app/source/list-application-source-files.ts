import { glob } from 'tinyglobby';

import {
  APPLICATION_SOURCE_GLOBS,
  APPLICATION_SOURCE_IGNORED_GLOBS,
} from '@/app/source/application-source-globs';

export const listApplicationSourceFiles = async (
  appPath: string,
): Promise<string[]> =>
  (
    await glob(APPLICATION_SOURCE_GLOBS, {
      cwd: appPath,
      absolute: true,
      ignore: APPLICATION_SOURCE_IGNORED_GLOBS,
      onlyFiles: true,
    })
  ).sort();
