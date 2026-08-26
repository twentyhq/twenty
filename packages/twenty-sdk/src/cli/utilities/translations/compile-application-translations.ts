import { readdir } from 'node:fs/promises';
import path from 'path';

import { compileCatalogToMessageIds } from '@/cli/utilities/translations/compile-catalog-to-message-ids';
import { pathExists, readJson } from '@/cli/utilities/file/fs-utils';
import { LOCALES_DIR } from '@/cli/utilities/translations/constants';
import { type TranslationsManifest } from 'twenty-shared/application';
import {
  APP_LOCALES,
  SOURCE_LOCALE,
  type AppLocale,
} from 'twenty-shared/translations';

const isSupportedLocale = (locale: string): locale is AppLocale =>
  Object.prototype.hasOwnProperty.call(APP_LOCALES, locale);

export const compileApplicationTranslations = async (
  appPath: string,
): Promise<TranslationsManifest> => {
  const localesDir = path.join(appPath, LOCALES_DIR);

  if (!(await pathExists(localesDir))) {
    return {};
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

    if (!isSupportedLocale(locale)) {
      console.warn(
        `Skipping translation file "${localeFile}": "${locale}" is not a supported locale.`,
      );
      continue;
    }

    const sourceToTranslation =
      (await readJson<Record<string, unknown>>(
        path.join(localesDir, localeFile),
      )) ?? {};

    const compiled = compileCatalogToMessageIds({
      catalog: sourceToTranslation,
      onCollision: ({ messageId, keptKey, droppedKey }) =>
        console.warn(
          `Message id collision in "${localeFile}": "${keptKey}" and "${droppedKey}" share id "${messageId}". Keeping "${keptKey}".`,
        ),
    });

    if (Object.keys(compiled).length > 0) {
      translations[locale] = compiled;
    }
  }

  return translations as TranslationsManifest;
};
