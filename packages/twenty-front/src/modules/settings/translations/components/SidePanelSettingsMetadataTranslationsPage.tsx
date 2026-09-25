import { MetadataTranslationsTable } from '@/settings/translations/components/MetadataTranslationsTable';
import {
  type MetadataTranslationRow,
  useMetadataTranslations,
} from '@/settings/translations/hooks/useMetadataTranslations';
import {
  type SettingsTranslationsSidePanelTarget,
  settingsTranslationsSidePanelTargetState,
} from '@/settings/translations/states/settingsTranslationsSidePanelTargetState';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components';
import { IconSearch } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';
import { useLocaleOptions } from '~/localization/hooks/useLocaleOptions';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

const DESCRIPTION_PROPERTY = 'description';

const StyledPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[8]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledSearchInputContainer = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
`;

const getMetadataTranslationsInput = (
  target: SettingsTranslationsSidePanelTarget,
) =>
  target.metadataName === 'objectMetadata'
    ? { objectMetadataId: target.recordId }
    : { fieldMetadataId: target.recordId };

export const SidePanelSettingsMetadataTranslationsPage = () => {
  const { t } = useLingui();
  const [searchTerm, setSearchTerm] = useState('');
  // Registry property keys are unique across metadata names, except
  // `description`, which reads the same on both.
  const columnLabelByProperty: Record<string, string> = {
    labelSingular: t`Singular`,
    labelPlural: t`Plural`,
    label: t`Label`,
    description: t`Description`,
  };
  const settingsTranslationsSidePanelTarget = useAtomStateValue(
    settingsTranslationsSidePanelTargetState,
  );
  const { metadataTranslations, saveTranslationRow } = useMetadataTranslations(
    isDefined(settingsTranslationsSidePanelTarget)
      ? getMetadataTranslationsInput(settingsTranslationsSidePanelTarget)
      : null,
  );
  const localeOptions = useLocaleOptions();

  if (!isDefined(settingsTranslationsSidePanelTarget)) {
    return null;
  }

  const rowsByProperty = new Map<string, Map<string, MetadataTranslationRow>>();

  for (const row of metadataTranslations) {
    const localeRows = rowsByProperty.get(row.property) ?? new Map();

    localeRows.set(row.locale, row);
    rowsByProperty.set(row.property, localeRows);
  }

  const toColumn = (property: string) => ({
    property,
    label: columnLabelByProperty[property] ?? property,
  });
  const labelColumns = [...rowsByProperty.keys()]
    .filter((property) => property !== DESCRIPTION_PROPERTY)
    .map(toColumn);
  const descriptionColumns = rowsByProperty.has(DESCRIPTION_PROPERTY)
    ? [toColumn(DESCRIPTION_PROPERTY)]
    : [];

  const normalizedSearchTerm = normalizeSearchText(searchTerm);
  const filteredLocaleOptions = localeOptions.filter(
    ({ label, searchKeywords }) =>
      normalizeSearchText(`${label} ${searchKeywords}`).includes(
        normalizedSearchTerm,
      ),
  );

  return (
    <StyledPageContainer>
      {labelColumns.length > 0 && (
        <Section.Root>
          <Section.Header
            title={t`Labels`}
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
            columns={labelColumns}
            rowsByProperty={rowsByProperty}
            localeOptions={filteredLocaleOptions}
            onSaveTranslationRow={saveTranslationRow}
          />
        </Section.Root>
      )}
      {descriptionColumns.length > 0 && (
        <Section.Root>
          <Section.Header title={t`Description`} />
          <MetadataTranslationsTable
            columns={descriptionColumns}
            rowsByProperty={rowsByProperty}
            localeOptions={filteredLocaleOptions}
            onSaveTranslationRow={saveTranslationRow}
          />
        </Section.Root>
      )}
    </StyledPageContainer>
  );
};
