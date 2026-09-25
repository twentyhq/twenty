import { type MetadataTranslationRow } from '@/settings/translations/hooks/useMetadataTranslations';
import { buildMetadataTranslationsTable } from '@/settings/translations/utils/buildMetadataTranslationsTable';
import { MetadataTranslationProvenance } from '~/generated-metadata/graphql';
import { type LocaleOption } from '~/localization/hooks/useLocaleOptions';

const buildTranslation = ({
  property,
  locale,
  value,
}: Pick<
  MetadataTranslationRow,
  'property' | 'locale' | 'value'
>): MetadataTranslationRow => ({
  metadataName: 'objectMetadata',
  recordId: 'object-metadata-id',
  property,
  locale,
  sourceValue: value,
  canonicalValue: value,
  value,
  provenance: MetadataTranslationProvenance.SHIPPED,
});

const LOCALE_OPTIONS: LocaleOption[] = [
  { value: 'de-DE', label: 'German', searchKeywords: '' },
  { value: 'fr-FR', label: 'French', searchKeywords: '' },
  { value: 'it-IT', label: 'Italian', searchKeywords: '' },
];

const FRENCH_DESCRIPTION = buildTranslation({
  property: 'description',
  locale: 'fr-FR',
  value: 'Une entreprise',
});
const FRENCH_SINGULAR = buildTranslation({
  property: 'labelSingular',
  locale: 'fr-FR',
  value: 'Entreprise',
});
const FRENCH_PLURAL = buildTranslation({
  property: 'labelPlural',
  locale: 'fr-FR',
  value: 'Entreprises',
});
const GERMAN_SINGULAR = buildTranslation({
  property: 'labelSingular',
  locale: 'de-DE',
  value: 'Unternehmen',
});

describe('buildMetadataTranslationsTable', () => {
  it('should return no properties and no rows without translations', () => {
    expect(
      buildMetadataTranslationsTable({
        metadataTranslations: [],
        localeOptions: LOCALE_OPTIONS,
      }),
    ).toEqual({ properties: [], languageRows: [] });
  });

  it('should list each property once, with the description last', () => {
    const { properties } = buildMetadataTranslationsTable({
      metadataTranslations: [
        FRENCH_DESCRIPTION,
        FRENCH_SINGULAR,
        FRENCH_PLURAL,
        GERMAN_SINGULAR,
      ],
      localeOptions: LOCALE_OPTIONS,
    });

    expect(properties).toEqual(['labelSingular', 'labelPlural', 'description']);
  });

  it('should align each language row with the properties', () => {
    const { languageRows } = buildMetadataTranslationsTable({
      metadataTranslations: [
        FRENCH_DESCRIPTION,
        FRENCH_SINGULAR,
        FRENCH_PLURAL,
        GERMAN_SINGULAR,
      ],
      localeOptions: LOCALE_OPTIONS,
    });

    expect(languageRows).toEqual([
      {
        locale: 'de-DE',
        label: 'German',
        translations: [GERMAN_SINGULAR, undefined, undefined],
      },
      {
        locale: 'fr-FR',
        label: 'French',
        translations: [FRENCH_SINGULAR, FRENCH_PLURAL, FRENCH_DESCRIPTION],
      },
    ]);
  });

  it('should only keep the given languages, in their order', () => {
    const { languageRows } = buildMetadataTranslationsTable({
      metadataTranslations: [FRENCH_SINGULAR, GERMAN_SINGULAR],
      localeOptions: [LOCALE_OPTIONS[1]],
    });

    expect(languageRows.map(({ locale }) => locale)).toEqual(['fr-FR']);
  });
});
