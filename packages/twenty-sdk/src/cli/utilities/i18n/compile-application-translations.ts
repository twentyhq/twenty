import { readdir } from 'node:fs/promises';
import path from 'path';

import { parseTranslationCatalogKey } from '@/sdk/front-component/i18n/message';
import { pathExists, readJson } from '@/cli/utilities/file/fs-utils';
import { LOCALES_DIR } from '@/cli/utilities/i18n/constants';
import { generateMessageId } from '@/cli/utilities/i18n/generate-message-id';
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
      (await readJson<Record<string, string>>(
        path.join(localesDir, localeFile),
      )) ?? {};

    const compiled: Record<string, string> = {};
    // Detect when two distinct catalog keys hash to the same message id so the
    // collision is reported instead of silently overwriting the earlier value.
    const keyByMessageId = new Map<string, string>();

    for (const [key, translation] of Object.entries(sourceToTranslation)) {
      if (typeof translation !== 'string' || translation.length === 0) {
        continue;
      }

      // A catalog key encodes the source message and its optional disambiguation
      // context; the message id must hash both so it matches the server lookup.
      const { message, context } = parseTranslationCatalogKey(key);
      const messageId = generateMessageId(message, context);
      const collidingKey = keyByMessageId.get(messageId);

      if (collidingKey !== undefined && collidingKey !== key) {
        console.warn(
          `Message id collision in "${localeFile}": "${key}" and "${collidingKey}" share id "${messageId}". Keeping "${key}".`,
        );
      }

      keyByMessageId.set(messageId, key);
      compiled[messageId] = translation;
    }

    if (Object.keys(compiled).length > 0) {
      translations[locale] = compiled;
    }
  }

  if (Object.keys(translations).length === 0) {
    return undefined;
  }

  return translations as TranslationsManifest;
};
