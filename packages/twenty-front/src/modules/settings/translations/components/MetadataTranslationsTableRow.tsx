import { MetadataTranslationValueCell } from '@/settings/translations/components/MetadataTranslationValueCell';
import { type MetadataTranslationRow } from '@/settings/translations/hooks/useMetadataTranslations';
import { type MetadataTranslationRowValue } from '@/settings/translations/types/MetadataTranslationRowValue';
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
  translations: (MetadataTranslationRow | undefined)[];
  onSaveTranslationRows: (
    rowValues: MetadataTranslationRowValue[],
  ) => Promise<void>;
};

export const MetadataTranslationsTableRow = ({
  gridTemplateColumns,
  localeLabel,
  translations,
  onSaveTranslationRows,
}: MetadataTranslationsTableRowProps) => {
  const { t } = useLingui();
  const editedTranslations = translations.filter(
    (translation): translation is MetadataTranslationRow =>
      translation?.provenance === MetadataTranslationProvenance.WORKSPACE,
  );

  const resetEditedTranslations = () =>
    onSaveTranslationRows(
      editedTranslations.map((translation) => ({
        row: translation,
        value: null,
      })),
    );

  return (
    <TableRow gridTemplateColumns={gridTemplateColumns}>
      <TableCell color={themeCssVariables.font.color.primary} overflow="hidden">
        <OverflowingTextWithTooltip text={localeLabel} />
      </TableCell>
      {translations.map((translation, index) => (
        <TableCell key={translation?.property ?? index} overflow="hidden">
          {isDefined(translation) && (
            <MetadataTranslationValueCell
              row={translation}
              onSave={(value) =>
                onSaveTranslationRows([{ row: translation, value }])
              }
            />
          )}
        </TableCell>
      ))}
      <TableCell padding="0">
        {isNonEmptyArray(editedTranslations) && (
          <LightIconButton
            title={t`Reset to default`}
            emphasis="subtle"
            onClick={resetEditedTranslations}
            aria-label={t`Reset to default`}
          >
            <IconRestore />
          </LightIconButton>
        )}
      </TableCell>
    </TableRow>
  );
};
