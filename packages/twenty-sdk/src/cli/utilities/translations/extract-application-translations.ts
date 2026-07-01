import { readdir } from 'node:fs/promises';
import path from 'path';

import { type Manifest } from 'twenty-shared/application';
import { SOURCE_LOCALE, type AppLocale } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import {
  getTranslationCatalogKey,
  type MessageDescriptor,
} from '@/sdk/front-component/translations/message';
import {
  ensureDir,
  pathExists,
  readJson,
  writeJson,
} from '@/cli/utilities/file/fs-utils';
import { collectFrontComponentStrings } from '@/cli/utilities/translations/collect-front-component-strings';
import { collectTranslatableStrings } from '@/cli/utilities/translations/collect-translatable-strings';
import { LOCALES_DIR } from '@/cli/utilities/translations/constants';

type ExtractApplicationTranslationsResult = {
  sourceCount: number;
  updatedLocaleFiles: string[];
};

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
    const existing = (await readJson<Record<string, unknown>>(filePath)) ?? {};
    const merged: Record<string, string> = {};

    for (const key of sortedKeys) {
      const existingValue = existing[key];

      merged[key] = typeof existingValue === 'string' ? existingValue : '';
    }

    await writeJson(filePath, merged);
  }

  return {
    sourceCount: sortedKeys.length,
    updatedLocaleFiles: existingLocaleFiles,
  };
};
