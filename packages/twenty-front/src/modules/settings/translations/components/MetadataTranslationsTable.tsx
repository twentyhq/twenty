import { StyledSettingsDataModelTableBodyContainer } from '@/settings/data-model/components/SettingsDataModelTableBodyContainer';
import { MetadataTranslationsTableRow } from '@/settings/translations/components/MetadataTranslationsTableRow';
import { type MetadataTranslationRow } from '@/settings/translations/hooks/useMetadataTranslations';
import { type MetadataTranslationRowValue } from '@/settings/translations/types/MetadataTranslationRowValue';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useLingui } from '@lingui/react/macro';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';
import { type LocaleOption } from '~/localization/hooks/useLocaleOptions';

type MetadataTranslationsTableProps = {
  columns: { property: string; label: string }[];
  rowsByProperty: Map<string, Map<string, MetadataTranslationRow>>;
  localeOptions: LocaleOption[];
  onSaveTranslationRows: (
    rowValues: MetadataTranslationRowValue[],
  ) => Promise<void>;
};

export const MetadataTranslationsTable = ({
  columns,
  rowsByProperty,
  localeOptions,
  onSaveTranslationRows,
}: MetadataTranslationsTableProps) => {
  const { t } = useLingui();
  const gridTemplateColumns = `160px repeat(${columns.length}, minmax(0, 1fr)) 24px`;

  const localeRows = localeOptions.flatMap(({ value: locale, label }) => {
    const rows = columns.map(({ property }) =>
      rowsByProperty.get(property)?.get(locale),
    );

    return rows.some(isDefined) ? [{ locale, label, rows }] : [];
  });

  return (
    <Table>
      <TableRow gridTemplateColumns={gridTemplateColumns}>
        <TableHeader>{t`Language`}</TableHeader>
        {columns.map(({ property, label }) => (
          <TableHeader key={property}>{label}</TableHeader>
        ))}
        <TableHeader />
      </TableRow>
      <StyledSettingsDataModelTableBodyContainer>
        <TableBody>
          {localeRows.map(({ locale, label, rows }) => (
            <MetadataTranslationsTableRow
              key={locale}
              gridTemplateColumns={gridTemplateColumns}
              localeLabel={label}
              rows={rows}
              onSaveTranslationRows={onSaveTranslationRows}
            />
          ))}
          {!isNonEmptyArray(localeRows) && (
            <TableCell color={themeCssVariables.font.color.tertiary}>
              {t`No languages found`}
            </TableCell>
          )}
        </TableBody>
      </StyledSettingsDataModelTableBodyContainer>
    </Table>
  );
};
