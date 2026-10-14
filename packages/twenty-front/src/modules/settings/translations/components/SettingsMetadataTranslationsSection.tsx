import { MetadataTranslationsTable } from '@/settings/translations/components/MetadataTranslationsTable';
import { useMetadataTranslations } from '@/settings/translations/hooks/useMetadataTranslations';
import { buildMetadataTranslationsTable } from '@/settings/translations/utils/buildMetadataTranslationsTable';
import { splitOptionLabelTranslations } from '@/settings/translations/utils/splitOptionLabelTranslations';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconSearch } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';
import { type MetadataTranslationsInput } from '~/generated-metadata/graphql';
import { useLocaleOptions } from '@/localization/hooks/useLocaleOptions';
import { normalizeSearchText } from 'twenty-ui/utilities';

const StyledSearchInputContainer = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
`;

type SettingsMetadataTranslationsSectionProps = {
  input: MetadataTranslationsInput;
};

export const SettingsMetadataTranslationsSection = ({
  input,
}: SettingsMetadataTranslationsSectionProps) => {
  const { t } = useLingui();
  const [searchTerm, setSearchTerm] = useState('');
  const columnLabelByProperty: Record<string, string> = {
    labelSingular: t`Singular`,
    labelPlural: t`Plural`,
    label: t`Label`,
    description: t`Description`,
  };
  const { metadataTranslations, loading, saveTranslationRows } =
    useMetadataTranslations(input);
  const localeOptions = useLocaleOptions();

  const normalizedSearchTerm = normalizeSearchText(searchTerm);
  const filteredLocaleOptions = localeOptions.filter(
    ({ label, searchKeywords }) =>
      normalizeSearchText(`${label} ${searchKeywords}`).includes(
        normalizedSearchTerm,
      ),
  );

  const { propertyTranslations, optionLabelTranslations } =
    splitOptionLabelTranslations(metadataTranslations);

  const { properties, languageRows } = buildMetadataTranslationsTable({
    metadataTranslations: propertyTranslations,
    localeOptions: filteredLocaleOptions,
  });
  const columns = properties.map((property) => ({
    property,
    label: columnLabelByProperty[property] ?? property,
  }));

  const optionLabelsTable = buildMetadataTranslationsTable({
    metadataTranslations: optionLabelTranslations,
    localeOptions: filteredLocaleOptions,
  });
  const optionColumns = optionLabelsTable.properties.map((property) => ({
    property,
    label:
      optionLabelTranslations.find(
        (translation) => translation.property === property,
      )?.sourceValue ?? property,
  }));

  return (
    <>
      <Section.Root>
        <Section.Header
          title={t`Languages`}
          description={t`Languages without a translation show the source text.`}
        />
        <StyledSearchInputContainer>
          <SettingsTextInput
            instanceId="settings-metadata-translations-search"
            LeftIcon={IconSearch}
            placeholder={t`Search a language...`}
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </StyledSearchInputContainer>
        <MetadataTranslationsTable
          columns={columns}
          languageRows={languageRows}
          loading={loading}
          onSaveTranslationRows={saveTranslationRows}
        />
      </Section.Root>
      {isNonEmptyArray(optionColumns) && (
        <Section.Root>
          <Section.Header
            title={t`Options`}
            description={t`What each language displays for this field's options.`}
          />
          <MetadataTranslationsTable
            columns={optionColumns}
            languageRows={optionLabelsTable.languageRows}
            loading={loading}
            onSaveTranslationRows={saveTranslationRows}
          />
        </Section.Root>
      )}
    </>
  );
};
