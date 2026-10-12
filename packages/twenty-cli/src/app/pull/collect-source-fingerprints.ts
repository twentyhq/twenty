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
  const localeFilePaths = await glob(
    [`${LOCALES_DIR}/*.json`, `${COMPILED_LOCALES_DIR}/*.json`],
    { cwd: appPath, absolute: true, onlyFiles: true },
  );
  const fingerprints: Record<string, string> = {};

  for (const filePath of [
    ...(await listApplicationSourceFiles(appPath)),
    ...localeFilePaths.sort(),
  ]) {
    fingerprints[relative(appPath, filePath).split(sep).join('/')] =
      hashContent(await readFile(filePath));
  }

  return fingerprints;
};
