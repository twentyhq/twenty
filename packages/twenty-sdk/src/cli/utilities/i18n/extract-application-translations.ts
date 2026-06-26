import { readdir } from 'node:fs/promises';
import path from 'path';

import {
  ensureDir,
  pathExists,
  readJson,
  writeJson,
} from '@/cli/utilities/file/fs-utils';
import { collectTranslatableStrings } from '@/cli/utilities/i18n/collect-translatable-strings';
import { LOCALES_DIR } from '@/cli/utilities/i18n/constants';
import { type Manifest } from 'twenty-shared/application';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

export type ExtractApplicationTranslationsResult = {
  sourceCount: number;
  updatedLocaleFiles: string[];
};

export const extractApplicationTranslations = async ({
  appPath,
  manifest,
}: {
  appPath: string;
  manifest: Manifest;
}): Promise<ExtractApplicationTranslationsResult> => {
  const sources = collectTranslatableStrings(manifest);
  const localesDir = path.join(appPath, LOCALES_DIR);

  await ensureDir(localesDir);

  const sourceCatalog: Record<string, string> = {};

  for (const source of sources) {
    sourceCatalog[source] = source;
  }

  await writeJson(path.join(localesDir, `${SOURCE_LOCALE}.json`), sourceCatalog);

  const existingLocaleFiles = (await pathExists(localesDir))
    ? (await readdir(localesDir)).filter(
        (entry) =>
          entry.endsWith('.json') && entry !== `${SOURCE_LOCALE}.json`,
      )
    : [];

  for (const localeFile of existingLocaleFiles) {
    const filePath = path.join(localesDir, localeFile);
    const existing = await readJson<Record<string, string>>(filePath);
    const merged: Record<string, string> = {};

    for (const source of sources) {
      merged[source] = existing[source] ?? '';
    }

    await writeJson(filePath, merged);
  }

  return { sourceCount: sources.length, updatedLocaleFiles: existingLocaleFiles };
};
