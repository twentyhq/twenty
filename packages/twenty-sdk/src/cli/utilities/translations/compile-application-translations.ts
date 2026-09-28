import { readdir } from 'node:fs/promises';
import path from 'path';

import { compileCatalogToMessageIds } from '@/cli/utilities/translations/compile-catalog-to-message-ids';
import { pathExists, readJson } from '@/cli/utilities/file/fs-utils';
import {
  COMPILED_LOCALES_DIR,
  LOCALES_DIR,
} from '@/cli/utilities/translations/constants';
import { isSupportedLocale } from '@/cli/utilities/translations/is-supported-locale';
import { type TranslationsManifest } from 'twenty-shared/application';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

const readLocaleCatalogFile = async (
  filePath: string,
  onWarning: (message: string) => void,
): Promise<Record<string, unknown> | null> => {
  let parsed: unknown;

  try {
    parsed = await readJson<unknown>(filePath);
  } catch {
    onWarning(
      `Skipping translation file "${path.basename(filePath)}": it is not valid JSON.`,
    );

    return null;
  }

  if (
    !isDefined(parsed) ||
    typeof parsed !== 'object' ||
    Array.isArray(parsed)
  ) {
    onWarning(
      `Skipping translation file "${path.basename(filePath)}": expected a JSON object.`,
    );

    return null;
  }

  return parsed as Record<string, unknown>;
};

const readCompiledCatalogs = async (
  appPath: string,
  onWarning: (message: string) => void,
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
      onWarning(
        `Skipping compiled translation file "${compiledFile}": "${locale}" is not a supported locale.`,
      );
      continue;
    }

    const compiledCatalog = await readLocaleCatalogFile(
      path.join(compiledDir, compiledFile),
      onWarning,
    );

    if (compiledCatalog === null) {
      continue;
    }

    const messages = Object.fromEntries(
      Object.entries(compiledCatalog).filter(
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
  onWarning: (message: string) => void = (message) => console.warn(message),
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
      onWarning(
        `Skipping translation file "${localeFile}": "${locale}" is not a supported locale.`,
      );
      continue;
    }

    const sourceToTranslation = await readLocaleCatalogFile(
      path.join(localesDir, localeFile),
      onWarning,
    );

    if (sourceToTranslation === null) {
      continue;
    }

    const compiled = compileCatalogToMessageIds({
      catalog: sourceToTranslation,
      onCollision: ({ messageId, keptKey, droppedKey }) =>
        onWarning(
          `Message id collision in "${localeFile}": "${keptKey}" and "${droppedKey}" share id "${messageId}". Keeping "${keptKey}".`,
        ),
    });

    if (Object.keys(compiled).length > 0) {
      translations[locale] = compiled;
    }
  }

  for (const [locale, messages] of Object.entries(
    await readCompiledCatalogs(appPath, onWarning),
  )) {
    translations[locale] = { ...messages, ...(translations[locale] ?? {}) };
  }

  return translations as TranslationsManifest;
};
