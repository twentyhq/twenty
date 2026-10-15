import { type TranslationsManifest } from 'twenty-shared/application';
import { type APP_LOCALES } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { type ApplicationTranslationSyncAction } from 'src/engine/core-modules/application/application-translation/types/application-translation-sync-action.type';
import { computeApplicationTranslationSyncActions } from 'src/engine/core-modules/application/application-translation/utils/compute-application-translation-sync-actions.util';

type StoredTranslationRow = {
  id: string;
  locale: keyof typeof APP_LOCALES;
  deletedAt: Date | null;
  messages: Record<string, string>;
};

export type ApplicationTranslationSyncPlan = {
  actions: ApplicationTranslationSyncAction[];
  rowsToUpdate: {
    id: string;
    locale: keyof typeof APP_LOCALES;
    messages: Record<string, string>;
  }[];
  rowsToInsert: {
    locale: keyof typeof APP_LOCALES;
    messages: Record<string, string>;
  }[];
  rowIdsToSoftDelete: string[];
};

// Prefer a soft-deleted row over none so a returning locale is revived, not duplicated
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
  const actions = computeApplicationTranslationSyncActions({
    existingRows,
    translations,
  });
  const plan: ApplicationTranslationSyncPlan = {
    actions,
    rowsToUpdate: [],
    rowsToInsert: [],
    rowIdsToSoftDelete: [],
  };

  for (const action of actions) {
    if (action.type === 'delete') {
      plan.rowIdsToSoftDelete.push(
        ...existingRows
          .filter(
            (row) => row.locale === action.locale && !isDefined(row.deletedAt),
          )
          .map((row) => row.id),
      );
      continue;
    }

    const messages = translations[action.locale];
    if (!isDefined(messages)) {
      continue;
    }
    const existingRow = rowByLocale.get(action.locale);
    if (isDefined(existingRow)) {
      plan.rowsToUpdate.push({
        id: existingRow.id,
        locale: action.locale,
        messages,
      });
    } else {
      plan.rowsToInsert.push({ locale: action.locale, messages });
    }
  }

  return plan;
};
