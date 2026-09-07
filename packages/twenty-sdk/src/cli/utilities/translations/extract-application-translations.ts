import { readdir } from 'node:fs/promises';
import path from 'path';

import { type Manifest } from 'twenty-shared/application';
import { SOURCE_LOCALE, type AppLocale } from 'twenty-shared/translations';

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
import {
  buildLocaleCatalog,
  flattenLocaleCatalog,
} from '@/cli/utilities/translations/locale-catalog-format';

type ExtractApplicationTranslationsResult = {
  sourceCount: number;
  updatedLocaleFiles: string[];
};

const collectSourceDescriptors = async ({
  manifest,
  frontComponentSourcePaths,
}: {
  manifest: Manifest;
  frontComponentSourcePaths: string[];
}): Promise<MessageDescriptor[]> => {
  const frontComponentDescriptors = await collectFrontComponentStrings(
    frontComponentSourcePaths,
  );

  const descriptorByKey = new Map<string, MessageDescriptor>();

  for (const descriptor of [
    ...collectTranslatableStrings(manifest),
    ...frontComponentDescriptors,
  ]) {
    descriptorByKey.set(
      getTranslationCatalogKey(descriptor.message, descriptor.context),
      descriptor,
    );
  }

  return [...descriptorByKey.values()];
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
  const descriptors = await collectSourceDescriptors({
    manifest,
    frontComponentSourcePaths,
  });

  const localesDir = path.join(appPath, LOCALES_DIR);

  await ensureDir(localesDir);

  // The source file carries the message as its own translation, so a
  // translator sees the original next to every hole they are filling.
  await writeJson(
    path.join(localesDir, `${SOURCE_LOCALE}.json`),
    buildLocaleCatalog(
      descriptors.map(({ message, context }) => ({
        message,
        context,
        translation: message,
      })),
    ),
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
    const existingTranslationByKey = new Map(
      flattenLocaleCatalog(existing).map((entry) => [
        getTranslationCatalogKey(entry.message, entry.context),
        entry.translation,
      ]),
    );

    await writeJson(
      filePath,
      buildLocaleCatalog(
        descriptors.map(({ message, context }) => ({
          message,
          context,
          translation:
            existingTranslationByKey.get(
              getTranslationCatalogKey(message, context),
            ) ?? '',
        })),
      ),
    );
  }

  return {
    sourceCount: descriptors.length,
    updatedLocaleFiles: existingLocaleFiles,
  };
};
