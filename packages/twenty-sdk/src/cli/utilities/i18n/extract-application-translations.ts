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
import { SOURCE_LOCALE, type AppLocale } from 'twenty-shared/translations';

export type ExtractApplicationTranslationsResult = {
  sourceCount: number;
  updatedLocaleFiles: string[];
};

export const extractApplicationTranslations = async ({
  appPath,
  manifest,
  scaffoldLocale,
}: {
  appPath: string;
  manifest: Manifest;
  scaffoldLocale?: AppLocale;
}): Promise<ExtractApplicationTranslationsResult> => {
  const sources = collectTranslatableStrings(manifest);
  const localesDir = path.join(appPath, LOCALES_DIR);

  await ensureDir(localesDir);

  const sourceCatalog: Record<string, string> = {};

  for (const source of sources) {
    sourceCatalog[source] = source;
  }

  await writeJson(
    path.join(localesDir, `${SOURCE_LOCALE}.json`),
    sourceCatalog,
  );

  // Create an empty catalog for a brand-new locale so the merge step below
  // populates it with the current source keys.
  if (scaffoldLocale !== undefined && scaffoldLocale !== SOURCE_LOCALE) {
    const scaffoldPath = path.join(localesDir, `${scaffoldLocale}.json`);

    if (!(await pathExists(scaffoldPath))) {
      await writeJson(scaffoldPath, {});
    }
  }

  const existingLocaleFiles = (await readdir(localesDir)).filter(
    (entry) => entry.endsWith('.json') && entry !== `${SOURCE_LOCALE}.json`,
  );

  for (const localeFile of existingLocaleFiles) {
    const filePath = path.join(localesDir, localeFile);
    const existing = (await readJson<Record<string, string>>(filePath)) ?? {};
    const merged: Record<string, string> = {};

    for (const source of sources) {
      merged[source] = existing[source] ?? '';
    }

    await writeJson(filePath, merged);
  }

  return {
    sourceCount: sources.length,
    updatedLocaleFiles: existingLocaleFiles,
  };
};
