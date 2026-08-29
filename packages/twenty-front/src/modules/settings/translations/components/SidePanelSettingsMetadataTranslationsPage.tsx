import { useLocaleOptions } from '~/localization/hooks/useLocaleOptions';
import { MetadataTranslationValueCell } from '@/settings/translations/components/MetadataTranslationValueCell';
import {
  type MetadataTranslationRow,
  useMetadataTranslations,
} from '@/settings/translations/hooks/useMetadataTranslations';
import {
  type SettingsTranslationsSidePanelTarget,
  settingsTranslationsSidePanelTargetState,
} from '@/settings/translations/states/settingsTranslationsSidePanelTargetState';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconRestore } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';
import { MetadataTranslationProvenance } from '~/generated-metadata/graphql';

const TRANSLATIONS_ROW_GRID_TEMPLATE_COLUMNS = '112px 1fr 24px';

const StyledPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledEntityLabel = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledExplanation = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledPropertySection = styled.div`
  display: flex;
  flex-direction: column;
`;

const getMetadataTranslationsInput = (
  target: SettingsTranslationsSidePanelTarget,
) =>
  target.metadataName === 'objectMetadata'
    ? { objectMetadataId: target.recordId }
    : { fieldMetadataId: target.recordId };

export const SidePanelSettingsMetadataTranslationsPage = () => {
  const { t } = useLingui();
  // Registry property keys are unique across metadata names, except
  // `description`, which reads the same on both.
  const labelByProperty: Record<string, string> = {
    labelSingular: t`Label (singular)`,
    labelPlural: t`Label (plural)`,
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

  return (
    <StyledPageContainer>
      <StyledHeader>
        <StyledEntityLabel>
          {settingsTranslationsSidePanelTarget.label}
        </StyledEntityLabel>
        <StyledExplanation>
          {t`Languages without their own translation show the source text.`}
        </StyledExplanation>
      </StyledHeader>
      {[...rowsByProperty.entries()].map(([property, localeRows]) => {
        const canonicalValue = localeRows.values().next().value?.canonicalValue;

        return (
          <StyledPropertySection key={property}>
            <H2Title
              title={labelByProperty[property] ?? property}
              description={t`Source: ${canonicalValue}`}
            />
            <Table>
              {localeOptions.map(({ value: locale, label: localeLabel }) => {
                const row = localeRows.get(locale);

                if (!isDefined(row)) {
                  return null;
                }

                const isEdited =
                  row.provenance === MetadataTranslationProvenance.WORKSPACE;

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
                      {isEdited && (
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
            </Table>
          </StyledPropertySection>
        );
      })}
    </StyledPageContainer>
  );
};
