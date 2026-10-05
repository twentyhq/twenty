import { type MetadataTranslationRow } from '@/settings/translations/hooks/useMetadataTranslations';
import { type MetadataTranslationLanguageRow } from '@/settings/translations/types/MetadataTranslationLanguageRow';
import { isDefined } from 'twenty-shared/utils';
import { type LocaleOption } from '~/localization/hooks/useLocaleOptions';

const DESCRIPTION_PROPERTY = 'description';

export const buildMetadataTranslationsTable = ({
  metadataTranslations,
  localeOptions,
}: {
  metadataTranslations: MetadataTranslationRow[];
  localeOptions: LocaleOption[];
}): {
  properties: string[];
  languageRows: MetadataTranslationLanguageRow[];
} => {
  const uniqueProperties = [
    ...new Set(metadataTranslations.map(({ property }) => property)),
  ];

  const properties = [
    ...uniqueProperties.filter((property) => property !== DESCRIPTION_PROPERTY),
    ...uniqueProperties.filter((property) => property === DESCRIPTION_PROPERTY),
  ];

  const languageRows = localeOptions.flatMap(({ value: locale, label }) => {
    const translations = properties.map((property) =>
      metadataTranslations.find(
        (translation) =>
          translation.property === property && translation.locale === locale,
      ),
    );

    return translations.some(isDefined)
      ? [{ locale, label, translations }]
      : [];
  });

  return { properties, languageRows };
};
