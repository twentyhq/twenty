import { type TranslationsManifest } from 'twenty-shared/application';
import { type AppLocale } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { type ApplicationTranslationSyncAction } from 'src/engine/core-modules/application/application-translation/types/application-translation-sync-action.type';

export const computeApplicationTranslationSyncActions = ({
  existingRows,
  translations,
}: {
  existingRows: {
    locale: AppLocale;
    messages: Record<string, string>;
    deletedAt: Date | null;
  }[];
  translations: TranslationsManifest | undefined;
}): ApplicationTranslationSyncAction[] => {
  if (!isDefined(translations)) {
    return [];
  }

  const existingByLocale = new Map(
    existingRows
      .filter((row) => !isDefined(row.deletedAt))
      .map((row) => [row.locale, row.messages]),
  );
  const locales = [
    ...new Set([
      ...existingByLocale.keys(),
      ...(Object.keys(translations) as AppLocale[]),
    ]),
  ].sort();

  return locales.flatMap((locale) => {
    const before = existingByLocale.get(locale);
    const after = translations[locale];
    const messageIds = [
      ...new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]),
    ].sort();
    const beforeMessages = new Map(Object.entries(before ?? {}));
    const afterMessages = new Map(Object.entries(after ?? {}));
    const diff = Object.fromEntries(
      messageIds
        .filter(
          (messageId) =>
            beforeMessages.get(messageId) !== afterMessages.get(messageId),
        )
        .map((messageId) => [
          messageId,
          {
            before: beforeMessages.get(messageId) ?? null,
            after: afterMessages.get(messageId) ?? null,
          },
        ]),
    );

    if (
      isDefined(before) &&
      isDefined(after) &&
      Object.keys(diff).length === 0
    ) {
      return [];
    }

    return [
      {
        type: !isDefined(before)
          ? 'create'
          : !isDefined(after)
            ? 'delete'
            : 'update',
        metadataName: 'applicationTranslation',
        locale,
        diff,
      },
    ];
  });
};
