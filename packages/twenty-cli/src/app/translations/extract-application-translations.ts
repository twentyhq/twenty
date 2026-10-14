import { mkdtemp, readdir, rename, rm } from 'node:fs/promises';
import { join } from 'node:path';

import { type Manifest } from 'twenty-shared/application';
import { SOURCE_LOCALE, type AppLocale } from 'twenty-shared/translations';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { ensureDir, pathExists, readJson, writeJson } from '@/app/fs-utils';
import { assertPullPaths } from '@/app/pull/assert-pull-paths';
import { collectFrontComponentStrings } from '@/app/translations/collect-front-component-strings';
import { collectTranslatableStrings } from '@/app/translations/collect-translatable-strings';
import { LOCALES_DIR } from '@/app/translations/constants';
import {
  buildLocaleCatalog,
  flattenLocaleCatalog,
} from '@/app/translations/locale-catalog-format';
import { getTranslationCatalogKey } from '@/app/translations/message';
import { CliError } from '@/output/cli-error';

const readExistingCatalog = async (
  filePath: string,
): Promise<Record<string, unknown>> => {
  try {
    const catalog = await readJson(filePath);

    if (
      isPlainObject(catalog) &&
      Object.values(catalog).every(
        (value) =>
          typeof value === 'string' ||
          (isPlainObject(value) &&
            Object.values(value).every(
              (translation) => typeof translation === 'string',
            )),
      )
    ) {
      return catalog;
    }
  } catch (error) {
    throw new CliError({
      code: 'INVALID_INPUT',
      message: `Cannot read translation catalog ${filePath}. No catalogs were updated.`,
      cause: error,
    });
  }
  throw new CliError({
    code: 'INVALID_INPUT',
    message: `Invalid translation catalog ${filePath}. Expected messages or context groups with string translations. No catalogs were updated.`,
  });
};

export const extractApplicationTranslations = async ({
  appPath,
  manifest,
  frontComponentSourcePaths = [],
  scaffoldLocale,
  signal,
}: {
  appPath: string;
  manifest: Manifest;
  frontComponentSourcePaths?: string[];
  scaffoldLocale?: AppLocale;
  signal: AbortSignal;
}) => {
  signal.throwIfAborted();
  const descriptorByKey = new Map(
    [
      ...collectTranslatableStrings(manifest),
      ...(await collectFrontComponentStrings(frontComponentSourcePaths)),
    ].map((descriptor) => [
      getTranslationCatalogKey(descriptor.message, descriptor.context),
      descriptor,
    ]),
  );
  const descriptors = [...descriptorByKey.values()];
  const localesDir = join(appPath, LOCALES_DIR);

  await assertPullPaths({ appPath, relativePaths: [LOCALES_DIR] });
  const localeFiles = new Set(
    ((await pathExists(localesDir)) ? await readdir(localesDir) : []).filter(
      (entry) => entry.endsWith('.json') && entry !== `${SOURCE_LOCALE}.json`,
    ),
  );

  if (isDefined(scaffoldLocale)) {
    localeFiles.add(`${scaffoldLocale}.json`);
  }

  const catalogs = new Map([
    [
      `${SOURCE_LOCALE}.json`,
      buildLocaleCatalog(
        descriptors.map(({ message, context }) => ({
          message,
          context,
          translation: message,
        })),
      ),
    ],
  ]);

  await assertPullPaths({
    appPath,
    relativePaths: [...catalogs.keys(), ...localeFiles].map((name) =>
      join(LOCALES_DIR, name),
    ),
  });

  for (const localeFile of [...localeFiles].sort()) {
    const filePath = join(localesDir, localeFile);
    const existing = (await pathExists(filePath))
      ? await readExistingCatalog(filePath)
      : {};
    const translationByKey = new Map(
      flattenLocaleCatalog(existing).map((entry) => [
        getTranslationCatalogKey(entry.message, entry.context),
        entry.translation,
      ]),
    );

    catalogs.set(
      localeFile,
      buildLocaleCatalog(
        descriptors.map(({ message, context }) => ({
          message,
          context,
          translation:
            translationByKey.get(getTranslationCatalogKey(message, context)) ??
            '',
        })),
      ),
    );
  }

  signal.throwIfAborted();
  await ensureDir(localesDir);
  const stagingDirectory = await mkdtemp(join(localesDir, '.twenty-extract-'));

  try {
    for (const [localeFile, catalog] of catalogs) {
      signal.throwIfAborted();
      await writeJson(join(stagingDirectory, localeFile), catalog);
    }
    for (const localeFile of catalogs.keys()) {
      signal.throwIfAborted();
      await rename(
        join(stagingDirectory, localeFile),
        join(localesDir, localeFile),
      );
    }
  } finally {
    await rm(stagingDirectory, { recursive: true, force: true });
  }

  return {
    sourceCount: descriptors.length,
    updatedLocaleFiles: [...catalogs.keys()].map((name) =>
      join(LOCALES_DIR, name),
    ),
  };
};
