import { readdir } from 'node:fs/promises';
import path from 'path';

import {
  APP_LOCALES,
  SOURCE_LOCALE,
  type AppLocale,
} from 'twenty-shared/translations';

import { type TranslationCatalogsByLocale } from '@/sdk/front-component/translations/message';
import { pathExists, readJson } from '@/cli/utilities/file/fs-utils';
import { LOCALES_DIR } from '@/cli/utilities/translations/constants';

const isSupportedLocale = (locale: string): locale is AppLocale =>
  Object.prototype.hasOwnProperty.call(APP_LOCALES, locale);

export const loadFrontComponentTranslationCatalogs = async (
  appPath: string,
): Promise<TranslationCatalogsByLocale> => {
  const localesDir = path.join(appPath, LOCALES_DIR);

  if (!(await pathExists(localesDir))) {
    return {};
  }

  const localeFiles = (await readdir(localesDir)).filter((entry) =>
    entry.endsWith('.json'),
  );

  const catalogs: TranslationCatalogsByLocale = {};

  for (const localeFile of localeFiles) {
    const locale = path.basename(localeFile, '.json');

    if (locale === SOURCE_LOCALE || !isSupportedLocale(locale)) {
      continue;
    }

    const catalog =
      (await readJson<Record<string, string>>(
        path.join(localesDir, localeFile),
      )) ?? {};

    const nonEmptyEntries: Record<string, string> = {};

    for (const [key, value] of Object.entries(catalog)) {
      if (typeof value === 'string' && value.length > 0) {
        nonEmptyEntries[key] = value;
      }
    }

    if (Object.keys(nonEmptyEntries).length > 0) {
      catalogs[locale] = nonEmptyEntries;
    }
  }

  return catalogs;
};
