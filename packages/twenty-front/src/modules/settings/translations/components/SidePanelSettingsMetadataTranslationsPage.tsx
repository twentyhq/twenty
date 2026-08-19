import { useLocaleOptions } from '~/localization/hooks/useLocaleOptions';
import { MetadataTranslationValueCell } from '@/settings/translations/components/MetadataTranslationValueCell';
import { MetadataTranslationProvenanceTag } from '@/settings/translations/components/MetadataTranslationProvenanceTag';
import {
  type MetadataTranslationRow,
  useMetadataTranslations,
} from '@/settings/translations/hooks/useMetadataTranslations';
import { useTranslatablePropertyLabel } from '@/settings/translations/hooks/useTranslatablePropertyLabel';
import { settingsTranslationsSidePanelTargetState } from '@/settings/translations/states/settingsTranslationsSidePanelTargetState';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { TableSection } from '@/ui/layout/table/components/TableSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconRestore } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { MetadataTranslationProvenance } from '~/generated-metadata/graphql';

const TRANSLATIONS_ROW_GRID_TEMPLATE_COLUMNS = '112px 1fr 82px 24px';

const StyledPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledEntityLabel = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

export const SidePanelSettingsMetadataTranslationsPage = () => {
  const { t } = useLingui();
  const settingsTranslationsSidePanelTarget = useAtomStateValue(
    settingsTranslationsSidePanelTargetState,
  );
  const { metadataTranslations, saveTranslationRow } = useMetadataTranslations(
    isDefined(settingsTranslationsSidePanelTarget)
      ? settingsTranslationsSidePanelTarget.metadataName === 'objectMetadata'
        ? { objectMetadataId: settingsTranslationsSidePanelTarget.recordId }
        : { fieldMetadataId: settingsTranslationsSidePanelTarget.recordId }
      : null,
  );
  const { getPropertyLabel } = useTranslatablePropertyLabel();
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

  return (
    <StyledPageContainer>
      <StyledEntityLabel>
        {settingsTranslationsSidePanelTarget.label}
      </StyledEntityLabel>
      {[...rowsByProperty.entries()].map(([property, localeRows]) => (
        <Table key={property}>
          <TableSection
            title={getPropertyLabel(
              settingsTranslationsSidePanelTarget.metadataName,
              property,
            )}
          >
            {localeOptions.map(({ value: locale, label: localeLabel }) => {
              const row = localeRows.get(locale);

              if (!isDefined(row)) {
                return null;
              }

              return (
                <TableRow
                  key={`${property}:${locale}`}
                  gridAutoColumns={TRANSLATIONS_ROW_GRID_TEMPLATE_COLUMNS}
                >
                  <TableCell>{localeLabel}</TableCell>
                  <TableCell>
                    <MetadataTranslationValueCell
                      row={row}
                      onSave={(value) => saveTranslationRow(row, value)}
                    />
                  </TableCell>
                  <TableCell>
                    <MetadataTranslationProvenanceTag
                      provenance={row.provenance}
                    />
                  </TableCell>
                  <TableCell>
                    {row.provenance ===
                      MetadataTranslationProvenance.WORKSPACE && (
                      <LightIconButton
                        Icon={IconRestore}
                        title={t`Reset to default`}
                        accent="tertiary"
                        onClick={() => saveTranslationRow(row, null)}
                      />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableSection>
        </Table>
      ))}
    </StyledPageContainer>
  );
};
