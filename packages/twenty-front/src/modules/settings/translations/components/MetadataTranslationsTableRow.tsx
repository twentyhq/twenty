import { MetadataTranslationValueCell } from '@/settings/translations/components/MetadataTranslationValueCell';
import { type MetadataTranslationRow } from '@/settings/translations/hooks/useMetadataTranslations';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useLingui } from '@lingui/react/macro';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components';
import { IconRestore } from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';
import { MetadataTranslationProvenance } from '~/generated-metadata/graphql';

type MetadataTranslationsTableRowProps = {
  gridTemplateColumns: string;
  localeLabel: string;
  rows: (MetadataTranslationRow | undefined)[];
  onSaveTranslationRow: (
    row: MetadataTranslationRow,
    value: string | null,
  ) => Promise<void>;
};

export const MetadataTranslationsTableRow = ({
  gridTemplateColumns,
  localeLabel,
  rows,
  onSaveTranslationRow,
}: MetadataTranslationsTableRowProps) => {
  const { t } = useLingui();
  const editedRows = rows.filter(
    (row): row is MetadataTranslationRow =>
      row?.provenance === MetadataTranslationProvenance.WORKSPACE,
  );

  const resetEditedRows = async () => {
    for (const row of editedRows) {
      await onSaveTranslationRow(row, null);
    }
  };

  return (
    <TableRow gridTemplateColumns={gridTemplateColumns}>
      <TableCell color={themeCssVariables.font.color.primary} overflow="hidden">
        <OverflowingTextWithTooltip text={localeLabel} />
      </TableCell>
      {rows.map((row, index) => (
        <TableCell key={row?.property ?? index} overflow="hidden">
          {isDefined(row) && (
            <MetadataTranslationValueCell
              row={row}
              onSave={(value) => onSaveTranslationRow(row, value)}
            />
          )}
        </TableCell>
      ))}
      <TableCell padding="0">
        {isNonEmptyArray(editedRows) && (
          <LightIconButton
            title={t`Reset to default`}
            emphasis="subtle"
            onClick={resetEditedRows}
            aria-label={t`Reset to default`}
          >
            <IconRestore />
          </LightIconButton>
        )}
      </TableCell>
    </TableRow>
  );
};
