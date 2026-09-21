import { readdir } from 'node:fs/promises';
import path from 'path';

import {
  APP_LOCALES,
  SOURCE_LOCALE,
  type AppLocale,
} from 'twenty-shared/translations';

import { type TranslationCatalogsByLocale } from '@/sdk/front-component/translations/message';
import { pathExists, readJson } from '@/cli/utilities/file/fs-utils';
import { compileCatalogToMessageIds } from '@/cli/utilities/translations/compile-catalog-to-message-ids';
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
