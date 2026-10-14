import { MetadataTranslationValueCell } from '@/settings/translations/components/MetadataTranslationValueCell';
import { type MetadataTranslationRow } from '@/settings/translations/hooks/useMetadataTranslations';
import { type MetadataTranslationRowValue } from '@/settings/translations/types/MetadataTranslationRowValue';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useLingui } from '@lingui/react/macro';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconRestore } from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';
import { MetadataTranslationProvenance } from '~/generated-metadata/graphql';

type MetadataOptionTranslationsTableRowProps = {
  gridTemplateColumns: string;
  translation: MetadataTranslationRow;
  onSaveTranslationRows: (
    rowValues: MetadataTranslationRowValue[],
  ) => Promise<void>;
};

export const MetadataOptionTranslationsTableRow = ({
  gridTemplateColumns,
  translation,
  onSaveTranslationRows,
}: MetadataOptionTranslationsTableRowProps) => {
  const { t } = useLingui();

  return (
    <TableRow gridTemplateColumns={gridTemplateColumns}>
      <TableCell color={themeCssVariables.font.color.primary} overflow="hidden">
        <OverflowingTextWithTooltip text={translation.canonicalValue} />
      </TableCell>
      <TableCell overflow="hidden">
        <MetadataTranslationValueCell
          row={translation}
          onSave={(value) =>
            onSaveTranslationRows([{ row: translation, value }])
          }
        />
      </TableCell>
      <TableCell padding="0">
        {translation.provenance === MetadataTranslationProvenance.WORKSPACE && (
          <LightIconButton
            title={t`Reset to default`}
            emphasis="subtle"
            onClick={() =>
              onSaveTranslationRows([{ row: translation, value: null }])
            }
            aria-label={t`Reset to default`}
          >
            <IconRestore />
          </LightIconButton>
        )}
      </TableCell>
    </TableRow>
  );
};
