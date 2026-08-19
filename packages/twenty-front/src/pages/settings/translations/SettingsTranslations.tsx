import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import {
  type MetadataTranslationRow,
  MetadataTranslationValueCell,
} from '@/settings/translations/components/MetadataTranslationValueCell';
import { MetadataTranslationProvenanceTag } from '@/settings/translations/components/MetadataTranslationProvenanceTag';
import { useMetadataTranslations } from '@/settings/translations/hooks/useMetadataTranslations';
import { useSaveMetadataTranslation } from '@/settings/translations/hooks/useSaveMetadataTranslation';
import { useTranslatablePropertyLabel } from '@/settings/translations/hooks/useTranslatablePropertyLabel';
import { Select } from '@/ui/input/components/Select';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { TableSection } from '@/ui/layout/table/components/TableSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { SOURCE_LOCALE, type AppLocale } from 'twenty-shared/translations';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined, isValidLocale } from 'twenty-shared/utils';
import { SearchInput } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { H2Title } from 'twenty-ui/typography';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useLocaleOptions } from '~/localization/hooks/useLocaleOptions';
import { MetadataTranslationProvenance } from '~/generated-metadata/graphql';

const TRANSLATIONS_PAGE_GRID_TEMPLATE_COLUMNS =
  'minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1.2fr) 82px';

const StyledLocaleSelectContainer = styled.div`
  flex-shrink: 0;
  width: 160px;
`;

const StyledControlsRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[4]};
`;

const StyledCompletion = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  margin-left: auto;
  white-space: nowrap;
`;

const StyledCanonical = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const SettingsTranslations = () => {
  const { t } = useLingui();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const memberLocale = currentWorkspaceMember?.locale ?? null;
  const [selectedLocale, setSelectedLocale] = useState<AppLocale>(
    isValidLocale(memberLocale) ? memberLocale : SOURCE_LOCALE,
  );
  const [searchTerm, setSearchTerm] = useState('');

  const localeOptions = useLocaleOptions();
  const { alphaSortedActiveNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();
  const { metadataTranslations, refetch } = useMetadataTranslations({
    locale: selectedLocale,
  });
  const { saveMetadataTranslation } = useSaveMetadataTranslation();
  const { getPropertyLabel } = useTranslatablePropertyLabel();

  const rowsByOwnerId = new Map<string, MetadataTranslationRow[]>();

  for (const row of metadataTranslations) {
    const ownerId = row.objectMetadataId ?? row.recordId;

    rowsByOwnerId.set(ownerId, [...(rowsByOwnerId.get(ownerId) ?? []), row]);
  }

  const fieldLabelByRecordId = new Map(
    metadataTranslations
      .filter(
        (row) => row.metadataName === 'fieldMetadata' && row.property === 'label',
      )
      .map((row) => [row.recordId, row.canonicalValue]),
  );

  const visibleOwnerIds = new Set(
    alphaSortedActiveNonSystemObjectMetadataItems.map(({ id }) => id),
  );
  const visibleTranslations = metadataTranslations.filter((row) =>
    visibleOwnerIds.has(row.objectMetadataId ?? row.recordId),
  );
  const translatedCount = visibleTranslations.filter(
    ({ provenance }) => provenance !== MetadataTranslationProvenance.INHERITED,
  ).length;

  const matchesSearch = (row: MetadataTranslationRow, entityLabel: string) => {
    if (searchTerm.trim() === '') {
      return true;
    }

    const needle = searchTerm.toLowerCase();

    return [entityLabel, row.canonicalValue, row.value].some((haystack) =>
      haystack.toLowerCase().includes(needle),
    );
  };

  const saveRow = async (row: MetadataTranslationRow, value: string | null) => {
    await saveMetadataTranslation({
      metadataName:
        row.metadataName === 'objectMetadata'
          ? 'objectMetadata'
          : 'fieldMetadata',
      recordId: row.recordId,
      objectMetadataId: row.objectMetadataId,
      locale: row.locale,
      property: row.property,
      value,
    });
    await refetch();
  };

  return (
    <SettingsPageLayout
      title={t`Translations`}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.General),
        },
        { children: t`Translations` },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Data model translations`}
            description={t`What each language displays for your objects and fields. Edits apply to the selected language only.`}
          />
          <StyledControlsRow>
            <StyledLocaleSelectContainer>
              <Select
                dropdownId="settings-translations-locale"
                dropdownWidthAuto
                withSearchInput
                fullWidth
                value={selectedLocale}
                options={localeOptions}
                onChange={(value) => setSelectedLocale(value as AppLocale)}
              />
            </StyledLocaleSelectContainer>
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder={t`Search a label`}
            />
            <StyledCompletion>
              {t`${translatedCount} of ${visibleTranslations.length} translated`}
            </StyledCompletion>
          </StyledControlsRow>
          {alphaSortedActiveNonSystemObjectMetadataItems.map(
            (objectMetadataItem, index) => {
            const objectRows = rowsByOwnerId.get(objectMetadataItem.id) ?? [];
            const visibleRows = objectRows.filter((row) => {
              const entityLabel =
                row.metadataName === 'objectMetadata'
                  ? objectMetadataItem.labelPlural
                  : (fieldLabelByRecordId.get(row.recordId) ?? '');

              return matchesSearch(row, entityLabel);
            });

            if (visibleRows.length === 0) {
              return null;
            }

            return (
              <Table key={objectMetadataItem.id}>
                <TableSection
                  title={objectMetadataItem.labelPlural}
                  isInitiallyExpanded={
                    searchTerm.trim() !== '' ? true : index === 0
                  }
                >
                  <TableRow
                    gridAutoColumns={TRANSLATIONS_PAGE_GRID_TEMPLATE_COLUMNS}
                  >
                    <TableHeader>{t`Label`}</TableHeader>
                    <TableHeader>{t`Canonical`}</TableHeader>
                    <TableHeader>{t`Translation`}</TableHeader>
                    <TableHeader></TableHeader>
                  </TableRow>
                  {visibleRows.map((row) => {
                    const fieldLabel =
                      row.metadataName === 'fieldMetadata'
                        ? (fieldLabelByRecordId.get(row.recordId) ?? '')
                        : null;
                    const rowLabel = isDefined(fieldLabel)
                      ? `${fieldLabel} · ${getPropertyLabel(row.metadataName, row.property)}`
                      : getPropertyLabel(row.metadataName, row.property);

                    return (
                      <TableRow
                        key={`${row.recordId}:${row.property}`}
                        gridAutoColumns={
                          TRANSLATIONS_PAGE_GRID_TEMPLATE_COLUMNS
                        }
                      >
                        <TableCell>{rowLabel}</TableCell>
                        <TableCell>
                          <StyledCanonical>
                            {row.canonicalValue}
                          </StyledCanonical>
                        </TableCell>
                        <TableCell>
                          <MetadataTranslationValueCell
                            row={row}
                            onSave={(value) => saveRow(row, value)}
                          />
                        </TableCell>
                        <TableCell>
                          <MetadataTranslationProvenanceTag
                            provenance={row.provenance}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableSection>
              </Table>
            );
            },
          )}
        </Section>
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
