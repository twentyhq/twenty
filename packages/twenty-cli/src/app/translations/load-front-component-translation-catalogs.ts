import { readdir } from 'node:fs/promises';
import path from 'path';

import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { type TranslationCatalogsByLocale } from '@/app/translations/types/translation-catalogs-by-locale.type';
import { pathExists, readJson } from '@/app/fs-utils';
import { compileCatalogToMessageIds } from '@/app/translations/compile-catalog-to-message-ids';
import { LOCALES_DIR } from '@/app/translations/constants';

import { isSupportedLocale } from '@/app/translations/is-supported-locale';

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
      (await readJson<Record<string, unknown>>(
        path.join(localesDir, localeFile),
      )) ?? {};

    const compiled = compileCatalogToMessageIds({ catalog });

    if (Object.keys(compiled).length > 0) {
      catalogs[locale] = compiled;
    }
  }

  return catalogs;
};
