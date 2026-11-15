import { ASSETS_DIR } from 'twenty-shared/application';
import { readFile } from 'node:fs/promises';
import { relative, sep } from 'node:path';

import { glob } from 'tinyglobby';

import { hashContent } from '@/utils/hash-content';
import { listApplicationSourceFiles } from '@/app/source/list-application-source-files';
import {
  COMPILED_LOCALES_DIR,
  LOCALES_DIR,
} from '@/app/translations/constants';

export const collectSourceFingerprints = async (
  appPath: string,
): Promise<Record<string, string>> => {
  const additionalFilePaths = await glob(
    [
      `${LOCALES_DIR}/*.json`,
      `${COMPILED_LOCALES_DIR}/*.json`,
      'package.json',
      'yarn.lock',
      `${ASSETS_DIR}/**/*`,
    ],
    { cwd: appPath, absolute: true, onlyFiles: true },
  );
  const fingerprints: Record<string, string> = {};

  for (const filePath of [
    ...(await listApplicationSourceFiles(appPath)),
    ...additionalFilePaths.sort(),
  ]) {
    fingerprints[relative(appPath, filePath).split(sep).join('/')] =
      hashContent(await readFile(filePath));
  }

  return fingerprints;
};
