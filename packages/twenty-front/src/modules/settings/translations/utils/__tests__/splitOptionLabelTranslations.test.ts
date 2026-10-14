import { type MetadataTranslationRow } from '@/settings/translations/hooks/useMetadataTranslations';
import { splitOptionLabelTranslations } from '@/settings/translations/utils/splitOptionLabelTranslations';
import { MetadataTranslationProvenance } from '~/generated-metadata/graphql';

const buildTranslation = (
  property: string,
  value: string,
): MetadataTranslationRow => ({
  metadataName: 'fieldMetadata',
  recordId: 'field-metadata-id',
  objectMetadataId: 'object-metadata-id',
  property,
  locale: 'fr-FR',
  sourceValue: value,
  canonicalValue: value,
  value,
  provenance: MetadataTranslationProvenance.INHERITED,
});

describe('splitOptionLabelTranslations', () => {
  it('should separate option label translations from field property translations', () => {
    const label = buildTranslation('label', 'Budget period');
    const description = buildTranslation('description', 'How often');
    const weekOption = buildTranslation('options.week-option-id.label', 'Week');

    expect(
      splitOptionLabelTranslations([label, weekOption, description]),
    ).toEqual({
      propertyTranslations: [label, description],
      optionLabelTranslations: [weekOption],
    });
  });
});
