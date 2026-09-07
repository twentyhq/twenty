import { pathExists } from '@/cli/utilities/file/fs-utils';
import {
  type PullDeletion,
  type PullWrite,
} from '@/cli/utilities/pull/plan-pull-writes';
import {
  type PulledLocaleCatalog,
  splitPulledTranslations,
} from '@/cli/utilities/pull/split-pulled-translations';
import {
  COMPILED_LOCALES_DIR,
  LOCALES_DIR,
} from '@/cli/utilities/translations/constants';
import {
  buildLocaleCatalog,
  flattenLocaleCatalog,
  type LocaleCatalogEntry,
} from '@/cli/utilities/translations/locale-catalog-format';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { type Manifest } from 'twenty-shared/application';
import { generateMessageId } from 'twenty-shared/i18n';
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
  existingContent: string | null;
};

type LocaleCatalogs = Partial<Record<string, Record<string, string>>>;

const isLocaleCatalogs = (value: unknown): value is LocaleCatalogs =>
  isDefined(value) && typeof value === 'object' && !Array.isArray(value);

const serializeLocaleFile = (value: unknown): string =>
  `${JSON.stringify(value, null, 2)}\n`;

const parseLocaleFile = (content: string | null): Record<string, unknown> => {
  if (!isDefined(content)) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(content);

    return isDefined(parsed) && typeof parsed === 'object'
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
};

const getEntryKey = ({ message, context }: LocaleCatalogEntry): string =>
  JSON.stringify([context ?? null, message]);

const promoteDecodedEntries = ({
  catalog,
  existingAuthoredContent,
  existingCompiledContent,
}: {
  catalog: PulledLocaleCatalog;
  existingAuthoredContent: string | null;
  existingCompiledContent: string | null;
}): Record<string, string | Record<string, string>> | null => {
  const authoredMessageIds = new Set(
    flattenLocaleCatalog(catalog.authored).map((entry) =>
      generateMessageId(entry.message, entry.context),
    ),
  );
  const promotedMessageIds = new Set(
    Object.keys(parseLocaleFile(existingCompiledContent)).filter(
      (messageId) =>
        !(messageId in catalog.compiled) && authoredMessageIds.has(messageId),
    ),
  );

  if (promotedMessageIds.size === 0) {
    return null;
  }

  const existingEntries = flattenLocaleCatalog(
    parseLocaleFile(existingAuthoredContent),
  );
  const existingKeys = new Set(existingEntries.map(getEntryKey));
  const promotedEntries = flattenLocaleCatalog(catalog.authored).filter(
    (entry) =>
      promotedMessageIds.has(generateMessageId(entry.message, entry.context)) &&
      !existingKeys.has(getEntryKey(entry)),
  );

  return buildLocaleCatalog([...existingEntries, ...promotedEntries]);
};

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

  if (!isLocaleCatalogs(exportedTranslations)) {
    return { writes, deletions, compiledEntryCountByLocale };
  }

  const catalogs = await splitPulledTranslations({
    manifest,
    frontComponentSourcePaths,
  });
  const exportedLocales = new Set<string>(catalogs.map(({ locale }) => locale));
  const baseTranslations: LocaleCatalogs = isLocaleCatalogs(
    baseManifest?.translations,
  )
    ? baseManifest.translations
    : {};
  const currentTranslations: LocaleCatalogs = exportedTranslations;

  for (const catalog of catalogs) {
    const { locale, authored, compiled } = catalog;
    const compiledEntryCount = Object.keys(compiled).length;

    if (compiledEntryCount > 0) {
      compiledEntryCountByLocale[locale] = compiledEntryCount;
    }

    const authoredRelativePath = getAuthoredRelativePath(locale);
    const compiledRelativePath = getCompiledRelativePath(locale);
    const existingAuthoredContent = await readExistingContent(
      join(appPath, authoredRelativePath),
    );
    const existingCompiledContent = await readExistingContent(
      join(appPath, compiledRelativePath),
    );
    const catalogUnchangedSinceBase =
      locale in baseTranslations &&
      JSON.stringify(baseTranslations[locale]) ===
        JSON.stringify(currentTranslations[locale]);
    const everyWantedFileExists =
      (Object.keys(authored).length === 0 ||
        isDefined(existingAuthoredContent)) &&
      (compiledEntryCount === 0 || isDefined(existingCompiledContent));
    const promotedAuthored =
      catalogUnchangedSinceBase && everyWantedFileExists
        ? promoteDecodedEntries({
            catalog,
            existingAuthoredContent,
            existingCompiledContent,
          })
        : null;

    if (
      catalogUnchangedSinceBase &&
      everyWantedFileExists &&
      !isDefined(promotedAuthored)
    ) {
      continue;
    }

    const localeFiles: LocaleFile[] = [
      {
        relativePath: authoredRelativePath,
        content: serializeLocaleFile(promotedAuthored ?? authored),
        isWanted: Object.keys(promotedAuthored ?? authored).length > 0,
        existingContent: existingAuthoredContent,
      },
      {
        relativePath: compiledRelativePath,
        content: serializeLocaleFile(compiled),
        isWanted: compiledEntryCount > 0,
        existingContent: existingCompiledContent,
      },
    ];

    for (const {
      relativePath,
      content,
      isWanted,
      existingContent,
    } of localeFiles) {
      const exists = isDefined(existingContent);

      if (!isWanted) {
        if (exists && relativePath === compiledRelativePath) {
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
