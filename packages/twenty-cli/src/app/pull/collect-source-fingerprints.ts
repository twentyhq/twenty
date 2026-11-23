import {
  ASSETS_DIR,
  APPLICATION_SOURCE_FILE_EXTENSIONS,
} from 'twenty-shared/application';
import { readFile } from 'node:fs/promises';
import { relative, sep } from 'node:path';

import { glob } from 'tinyglobby';

import { hashContent } from '@/utils/hash-content';
import { APPLICATION_SOURCE_IGNORED_GLOBS } from '@/app/source/application-source-globs';
import {
  COMPILED_LOCALES_DIR,
  LOCALES_DIR,
} from '@/app/translations/constants';

export const collectSourceFingerprints = async (
  appPath: string,
): Promise<Record<string, string>> => {
  const filePaths = await glob(
    [
      ...APPLICATION_SOURCE_FILE_EXTENSIONS.map(
        (extension) => `**/*${extension}`,
      ),
      `${LOCALES_DIR}/*.json`,
      `${COMPILED_LOCALES_DIR}/*.json`,
      'package.json',
      'yarn.lock',
      `${ASSETS_DIR}/**/*`,
    ],
    {
      cwd: appPath,
      absolute: true,
      onlyFiles: true,
      ignore: APPLICATION_SOURCE_IGNORED_GLOBS.filter(
        (pattern) => pattern !== '**/*.d.ts' && pattern !== `${ASSETS_DIR}/**`,
      ),
    },
  );
  const fingerprints: Record<string, string> = {};

  for (const filePath of filePaths.sort()) {
    fingerprints[relative(appPath, filePath).split(sep).join('/')] =
      hashContent(await readFile(filePath));
  }

  return fingerprints;
};
