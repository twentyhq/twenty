import { StyledSettingsDataModelTableBodyContainer } from '@/settings/data-model/components/SettingsDataModelTableBodyContainer';
import { MetadataTranslationsTableRow } from '@/settings/translations/components/MetadataTranslationsTableRow';
import { type MetadataTranslationRow } from '@/settings/translations/hooks/useMetadataTranslations';
import { type MetadataTranslationRowValue } from '@/settings/translations/types/MetadataTranslationRowValue';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import Skeleton from 'react-loading-skeleton';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme';
import { type LocaleOption } from '~/localization/hooks/useLocaleOptions';

const LANGUAGE_AND_RESET_COLUMNS_WIDTH = 184;
const TRANSLATION_COLUMN_MOBILE_MIN_WIDTH = 150;

const StyledScrollWrapper = styled.div`
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
`;

const StyledScrollableContent = styled.div<{ mobileMinWidth: number }>`
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    min-width: ${({ mobileMinWidth }) => `${mobileMinWidth}px`};
  }
`;

type MetadataTranslationsTableProps = {
  columns: { property: string; label: string }[];
  rowsByProperty: Map<string, Map<string, MetadataTranslationRow>>;
  localeOptions: LocaleOption[];
  loading: boolean;
  onSaveTranslationRows: (
    rowValues: MetadataTranslationRowValue[],
  ) => Promise<void>;
};

export const MetadataTranslationsTable = ({
  columns,
  rowsByProperty,
  localeOptions,
  loading,
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

  const showSkeleton = loading && rowsByProperty.size === 0;

  return (
    <StyledScrollWrapper>
      <StyledScrollableContent
        mobileMinWidth={
          LANGUAGE_AND_RESET_COLUMNS_WIDTH +
          columns.length * TRANSLATION_COLUMN_MOBILE_MIN_WIDTH
        }
      >
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
              {showSkeleton
                ? Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton height={32} borderRadius={4} key={index} />
                  ))
                : localeRows.map(({ locale, label, rows }) => (
                    <MetadataTranslationsTableRow
                      key={locale}
                      gridTemplateColumns={gridTemplateColumns}
                      localeLabel={label}
                      rows={rows}
                      onSaveTranslationRows={onSaveTranslationRows}
                    />
                  ))}
              {!showSkeleton && !isNonEmptyArray(localeRows) && (
                <TableCell color={themeCssVariables.font.color.tertiary}>
                  {t`No languages found`}
                </TableCell>
              )}
            </TableBody>
          </StyledSettingsDataModelTableBodyContainer>
        </Table>
      </StyledScrollableContent>
    </StyledScrollWrapper>
  );
};
