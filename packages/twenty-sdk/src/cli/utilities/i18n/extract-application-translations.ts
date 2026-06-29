import { readdir } from 'node:fs/promises';
import path from 'path';

import { type Manifest } from 'twenty-shared/application';
import { SOURCE_LOCALE, type AppLocale } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import {
  getTranslationCatalogKey,
  type MessageDescriptor,
} from '@/sdk/front-component/i18n/message';
import {
  ensureDir,
  pathExists,
  readJson,
  writeJson,
} from '@/cli/utilities/file/fs-utils';
import { collectFrontComponentStrings } from '@/cli/utilities/i18n/collect-front-component-strings';
import { collectTranslatableStrings } from '@/cli/utilities/i18n/collect-translatable-strings';
import { LOCALES_DIR } from '@/cli/utilities/i18n/constants';

export type ExtractApplicationTranslationsResult = {
  sourceCount: number;
  updatedLocaleFiles: string[];
};

// Merges manifest-metadata strings (no context) with front-component source
// strings (optional context), keyed by their catalog key so identical
// source/context pairs collapse to a single entry.
const collectSourceEntries = async ({
  manifest,
  frontComponentSourcePaths,
}: {
  manifest: Manifest;
  frontComponentSourcePaths: string[];
}): Promise<Map<string, MessageDescriptor>> => {
  const manifestDescriptors: MessageDescriptor[] = collectTranslatableStrings(
    manifest,
  ).map((message) => ({ message }));

  const frontComponentDescriptors = await collectFrontComponentStrings(
    frontComponentSourcePaths,
  );

  const descriptorByKey = new Map<string, MessageDescriptor>();

  for (const descriptor of [
    ...manifestDescriptors,
    ...frontComponentDescriptors,
  ]) {
    descriptorByKey.set(
      getTranslationCatalogKey(descriptor.message, descriptor.context),
      descriptor,
    );
  }

  return descriptorByKey;
};

export const extractApplicationTranslations = async ({
  appPath,
  manifest,
  frontComponentSourcePaths = [],
  scaffoldLocale,
}: {
  appPath: string;
  manifest: Manifest;
  frontComponentSourcePaths?: string[];
  scaffoldLocale?: AppLocale;
}): Promise<ExtractApplicationTranslationsResult> => {
  const descriptorByKey = await collectSourceEntries({
    manifest,
    frontComponentSourcePaths,
  });

  const sortedKeys = [...descriptorByKey.keys()].sort();
  const localesDir = path.join(appPath, LOCALES_DIR);

  await ensureDir(localesDir);

  const sourceCatalog: Record<string, string> = {};

  for (const key of sortedKeys) {
    const descriptor = descriptorByKey.get(key);

    if (isDefined(descriptor)) {
      sourceCatalog[key] = descriptor.message;
    }
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

    for (const key of sortedKeys) {
      merged[key] = existing[key] ?? '';
    }

    await writeJson(filePath, merged);
  }

  return {
    sourceCount: sortedKeys.length,
    updatedLocaleFiles: existingLocaleFiles,
  };
};
