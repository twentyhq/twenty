import { MetadataTranslationsTable } from '@/settings/translations/components/MetadataTranslationsTable';
import { useMetadataTranslations } from '@/settings/translations/hooks/useMetadataTranslations';
import { buildMetadataTranslationsTable } from '@/settings/translations/utils/buildMetadataTranslationsTable';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { Section } from 'twenty-ui/components';
import { IconSearch } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';
import { type MetadataTranslationsInput } from '~/generated-metadata/graphql';
import { useLocaleOptions } from '~/localization/hooks/useLocaleOptions';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

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

  const { properties, languageRows } = buildMetadataTranslationsTable({
    metadataTranslations,
    localeOptions: filteredLocaleOptions,
  });
  const columns = properties.map((property) => ({
    property,
    label: columnLabelByProperty[property] ?? property,
  }));

  return (
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
  );
};
