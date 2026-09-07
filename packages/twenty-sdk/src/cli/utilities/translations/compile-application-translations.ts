import { readdir } from 'node:fs/promises';
import path from 'path';

import { compileCatalogToMessageIds } from '@/cli/utilities/translations/compile-catalog-to-message-ids';
import { pathExists, readJson } from '@/cli/utilities/file/fs-utils';
import {
  COMPILED_LOCALES_DIR,
  LOCALES_DIR,
} from '@/cli/utilities/translations/constants';
import { type TranslationsManifest } from 'twenty-shared/application';
import {
  APP_LOCALES,
  SOURCE_LOCALE,
  type AppLocale,
} from 'twenty-shared/translations';

const isSupportedLocale = (locale: string): locale is AppLocale =>
  Object.prototype.hasOwnProperty.call(APP_LOCALES, locale);

const readCompiledCatalogs = async (
  appPath: string,
): Promise<Record<string, Record<string, string>>> => {
  const compiledDir = path.join(appPath, COMPILED_LOCALES_DIR);

  if (!(await pathExists(compiledDir))) {
    return {};
  }

  const catalogs: Record<string, Record<string, string>> = {};

  for (const compiledFile of (await readdir(compiledDir)).filter((entry) =>
    entry.endsWith('.json'),
  )) {
    const locale = path.basename(compiledFile, '.json');

    if (locale === SOURCE_LOCALE) {
      continue;
    }

    if (!isSupportedLocale(locale)) {
      console.warn(
        `Skipping compiled translation file "${compiledFile}": "${locale}" is not a supported locale.`,
      );
      continue;
    }

    const messages = Object.fromEntries(
      Object.entries(
        (await readJson<Record<string, unknown>>(
          path.join(compiledDir, compiledFile),
        )) ?? {},
      ).filter(
        (entry): entry is [string, string] =>
          typeof entry[1] === 'string' && entry[1].length > 0,
      ),
    );

    if (Object.keys(messages).length > 0) {
      catalogs[locale] = messages;
    }
  }

  return catalogs;
};

export const compileApplicationTranslations = async (
  appPath: string,
): Promise<TranslationsManifest | undefined> => {
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

  for (const [locale, messages] of Object.entries(
    await readCompiledCatalogs(appPath),
  )) {
    translations[locale] = { ...messages, ...(translations[locale] ?? {}) };
  }

  return translations as TranslationsManifest;
};
