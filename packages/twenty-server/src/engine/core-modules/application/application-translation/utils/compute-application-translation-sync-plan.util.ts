import { type TranslationsManifest } from 'twenty-shared/application';
import { type APP_LOCALES } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

type StoredTranslationRow = {
  id: string;
  locale: keyof typeof APP_LOCALES;
  deletedAt: Date | null;
};

export type ApplicationTranslationSyncPlan = {
  rowsToUpdate: { id: string; messages: Record<string, string> }[];
  rowsToInsert: {
    locale: keyof typeof APP_LOCALES;
    messages: Record<string, string>;
  }[];
  rowIdsToSoftDelete: string[];
};

// A soft-deleted row is preferred over none, so a locale that comes back is
// revived rather than duplicated.
const pickRowByLocale = (
  existingRows: StoredTranslationRow[],
): Map<keyof typeof APP_LOCALES, StoredTranslationRow> => {
  const rowByLocale = new Map<keyof typeof APP_LOCALES, StoredTranslationRow>();

  for (const row of existingRows) {
    const currentRow = rowByLocale.get(row.locale);

    const shouldPreferRow =
      !isDefined(currentRow) ||
      (isDefined(currentRow.deletedAt) && !isDefined(row.deletedAt));

    if (shouldPreferRow) {
      rowByLocale.set(row.locale, row);
    }
  }

  return rowByLocale;
};

export const computeApplicationTranslationSyncPlan = ({
  existingRows,
  translations,
}: {
  existingRows: StoredTranslationRow[];
  translations: TranslationsManifest;
}): ApplicationTranslationSyncPlan => {
  const rowByLocale = pickRowByLocale(existingRows);
  const manifestEntries = Object.entries(translations) as [
    keyof typeof APP_LOCALES,
    Record<string, string>,
  ][];
  const manifestLocales = new Set(manifestEntries.map(([locale]) => locale));

  const rowsToUpdate = manifestEntries
    .map(([locale, messages]) => {
      const existingRow = rowByLocale.get(locale);

      return isDefined(existingRow)
        ? { id: existingRow.id, messages }
        : undefined;
    })
    .filter(isDefined);

  const rowsToInsert = manifestEntries
    .filter(([locale]) => !isDefined(rowByLocale.get(locale)))
    .map(([locale, messages]) => ({ locale, messages }));

  const rowIdsToSoftDelete = existingRows
    .filter(
      (row) => !manifestLocales.has(row.locale) && !isDefined(row.deletedAt),
    )
    .map((row) => row.id);

  return { rowsToUpdate, rowsToInsert, rowIdsToSoftDelete };
};
