import { readdir } from 'node:fs/promises';
import path from 'path';

import { pathExists, readJson } from '@/cli/utilities/file/fs-utils';
import { LOCALES_DIR } from '@/cli/utilities/i18n/constants';
import { generateMessageId } from '@/cli/utilities/i18n/generate-message-id';
import { type ManifestTranslations } from 'twenty-shared/application';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

export const compileApplicationTranslations = async (
  appPath: string,
): Promise<ManifestTranslations | undefined> => {
  const localesDir = path.join(appPath, LOCALES_DIR);

  if (!(await pathExists(localesDir))) {
    return undefined;
  }

  const localeFiles = (await readdir(localesDir)).filter((entry) =>
    entry.endsWith('.json'),
  );

  const translations: Record<string, Record<string, string>> = {};

  for (const localeFile of localeFiles) {
    const locale = path.basename(localeFile, '.json');

    if (locale === SOURCE_LOCALE) {
      continue;
    }

    const sourceToTranslation = await readJson<Record<string, string>>(
      path.join(localesDir, localeFile),
    );

    const compiled: Record<string, string> = {};

    for (const [source, translation] of Object.entries(sourceToTranslation)) {
      if (typeof translation === 'string' && translation.length > 0) {
        compiled[generateMessageId(source)] = translation;
      }
    }

    if (Object.keys(compiled).length > 0) {
      translations[locale] = compiled;
    }
  }

  if (Object.keys(translations).length === 0) {
    return undefined;
  }

  return translations as ManifestTranslations;
};
