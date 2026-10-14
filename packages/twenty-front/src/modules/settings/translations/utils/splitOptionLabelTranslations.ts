import { type MetadataTranslationRow } from '@/settings/translations/hooks/useMetadataTranslations';
import { getOptionIdFromFieldOptionLabelTranslationProperty } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';

export const splitOptionLabelTranslations = (
  metadataTranslations: MetadataTranslationRow[],
): {
  propertyTranslations: MetadataTranslationRow[];
  optionLabelTranslations: MetadataTranslationRow[];
} => {
  const isOptionLabelTranslation = ({ property }: MetadataTranslationRow) =>
    isDefined(getOptionIdFromFieldOptionLabelTranslationProperty(property));

  return {
    propertyTranslations: metadataTranslations.filter(
      (translation) => !isOptionLabelTranslation(translation),
    ),
    optionLabelTranslations: metadataTranslations.filter(
      isOptionLabelTranslation,
    ),
  };
};
