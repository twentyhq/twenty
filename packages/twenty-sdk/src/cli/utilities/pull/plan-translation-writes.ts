import { pathExists } from '@/cli/utilities/file/fs-utils';
import {
  type PullDeletion,
  type PullWrite,
} from '@/cli/utilities/pull/plan-pull-writes';
import { splitPulledTranslations } from '@/cli/utilities/pull/split-pulled-translations';
import {
  COMPILED_LOCALES_DIR,
  LOCALES_DIR,
} from '@/cli/utilities/translations/constants';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

export type TranslationWritePlan = {
  writes: PullWrite[];
  deletions: PullDeletion[];
  compiledEntryCountByLocale: Record<string, number>;
};

type LocaleFile = {
  relativePath: string;
  content: string;
  isWanted: boolean;
};

const serializeLocaleFile = (value: unknown): string =>
  `${JSON.stringify(value, null, 2)}\n`;

const getAuthoredRelativePath = (locale: string): string =>
  `${LOCALES_DIR}/${locale}.json`;

const getCompiledRelativePath = (locale: string): string =>
  `${COMPILED_LOCALES_DIR}/${locale}.json`;

const readExistingContent = async (
  absolutePath: string,
): Promise<string | null> =>
  (await pathExists(absolutePath))
    ? await readFile(absolutePath, 'utf8')
    : null;

export const planTranslationWrites = async ({
  appPath,
  manifest,
  baseManifest,
  frontComponentSourcePaths,
}: {
  appPath: string;
  manifest: Manifest;
  baseManifest: Manifest | null;
  frontComponentSourcePaths: string[];
}): Promise<TranslationWritePlan> => {
  const writes: PullWrite[] = [];
  const deletions: PullDeletion[] = [];
  const compiledEntryCountByLocale: Record<string, number> = {};
  const exportedTranslations = manifest.translations;

  if (!isDefined(exportedTranslations)) {
    return { writes, deletions, compiledEntryCountByLocale };
  }

  const catalogs = await splitPulledTranslations({
    manifest,
    frontComponentSourcePaths,
  });
  const exportedLocales = new Set(catalogs.map(({ locale }) => locale));
  const baseTranslations = baseManifest?.translations ?? {};

  for (const { locale, authored, compiled } of catalogs) {
    const compiledEntryCount = Object.keys(compiled).length;

    if (compiledEntryCount > 0) {
      compiledEntryCountByLocale[locale] = compiledEntryCount;
    }

    const localeFiles: LocaleFile[] = [
      {
        relativePath: getAuthoredRelativePath(locale),
        content: serializeLocaleFile(authored),
        isWanted: Object.keys(authored).length > 0,
      },
      {
        relativePath: getCompiledRelativePath(locale),
        content: serializeLocaleFile(compiled),
        isWanted: compiledEntryCount > 0,
      },
    ];
    const existingContentByRelativePath = new Map(
      await Promise.all(
        localeFiles.map(
          async ({ relativePath }) =>
            [
              relativePath,
              await readExistingContent(join(appPath, relativePath)),
            ] as const,
        ),
      ),
    );
    const catalogUnchangedSinceBase =
      locale in baseTranslations &&
      JSON.stringify(
        baseTranslations[locale as keyof typeof baseTranslations],
      ) ===
        JSON.stringify(
          exportedTranslations[locale as keyof typeof exportedTranslations],
        );
    const everyWantedFileExists = localeFiles.every(
      ({ relativePath, isWanted }) =>
        !isWanted || isDefined(existingContentByRelativePath.get(relativePath)),
    );

    if (catalogUnchangedSinceBase && everyWantedFileExists) {
      continue;
    }

    for (const { relativePath, content, isWanted } of localeFiles) {
      const existingContent = existingContentByRelativePath.get(relativePath);
      const exists = isDefined(existingContent);

      if (!isWanted) {
        if (exists && relativePath.startsWith(COMPILED_LOCALES_DIR)) {
          deletions.push({ universalIdentifier: locale, relativePath });
        }
        continue;
      }

      if (existingContent === content) {
        continue;
      }

      writes.push({
        kind: 'translation',
        universalIdentifier: locale,
        relativePath,
        content,
        isRegeneration: exists,
      });
    }
  }

  for (const locale of Object.keys(baseTranslations)) {
    if (exportedLocales.has(locale)) {
      continue;
    }

    for (const relativePath of [
      getAuthoredRelativePath(locale),
      getCompiledRelativePath(locale),
    ]) {
      if (await pathExists(join(appPath, relativePath))) {
        deletions.push({ universalIdentifier: locale, relativePath });
      }
    }
  }

  return { writes, deletions, compiledEntryCountByLocale };
};
