import { type MetadataTranslationRow } from '@/settings/translations/hooks/useMetadataTranslations';

export type MetadataTranslationLanguageRow = {
  locale: string;
  label: string;
  translations: (MetadataTranslationRow | undefined)[];
};
