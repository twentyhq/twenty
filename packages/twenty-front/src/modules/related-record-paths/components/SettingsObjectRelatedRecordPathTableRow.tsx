import { useLingui } from '@lingui/react/macro';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconTrash, useIcons } from 'twenty-ui/icon';
import { Chip } from 'twenty-ui/primitives/data-display';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useRelatedRecordPathMutations } from '@/related-record-paths/hooks/useRelatedRecordPathMutations';
import { RELATED_RECORD_PATH_TABLE_GRID_TEMPLATE_COLUMNS } from '@/related-record-paths/constants/RelatedRecordPathTableGridTemplateColumns';
import { getRelatedRecordPathFieldMetadataIds } from '@/related-record-paths/utils/getRelatedRecordPathFieldMetadataIds';
import { getRelatedRecordPathSteps } from '@/related-record-paths/utils/getRelatedRecordPathSteps';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { type RelatedRecordPath } from '~/generated-metadata/graphql';

type SettingsObjectRelatedRecordPathTableRowProps = {
  sourceObjectMetadataItem: EnrichedObjectMetadataItem;
  relatedRecordPath: RelatedRecordPath;
  isReadOnly: boolean;
};

export const SettingsObjectRelatedRecordPathTableRow = ({
  sourceObjectMetadataItem,
  relatedRecordPath,
  isReadOnly,
}: SettingsObjectRelatedRecordPathTableRowProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { getIcon } = useIcons();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { deleteRelatedRecordPath, isSaving } = useRelatedRecordPathMutations();

  const steps = getRelatedRecordPathSteps({
    sourceObjectMetadataItem,
    fieldMetadataIds: getRelatedRecordPathFieldMetadataIds(relatedRecordPath),
    objectMetadataItems,
  });
  const reachedObjectMetadataItem = steps.at(-1)?.targetObjectMetadataItem;
  const relationLabel = steps
    .map(({ fieldMetadataItem }) => fieldMetadataItem.label)
    .join(' › ');
  const FirstFieldIcon = getIcon(steps.at(0)?.fieldMetadataItem.icon);

  return (
    <TableRow
      gridTemplateColumns={RELATED_RECORD_PATH_TABLE_GRID_TEMPLATE_COLUMNS}
    >
      <TableCell
        color={themeCssVariables.font.color.primary}
        gap={themeCssVariables.spacing[2]}
      >
        <ObjectMetadataIcon
          objectMetadataItem={reachedObjectMetadataItem}
          size={theme.icon.size.md}
        />
        {reachedObjectMetadataItem?.labelPlural ?? t`Unavailable object`}
      </TableCell>
      <TableCell minWidth="0" overflow="hidden">
        <Chip
          variant="soft"
          startElement={<FirstFieldIcon size={theme.icon.size.sm} />}
        >
          {relationLabel}
        </Chip>
      </TableCell>
      <TableCell align="center">
        {!isReadOnly && (
          <LightIconButton
            emphasis="subtle"
            disabled={isSaving}
            aria-label={t`Delete related record path`}
            onClick={() => deleteRelatedRecordPath(relatedRecordPath.id)}
          >
            <IconTrash />
          </LightIconButton>
        )}
      </TableCell>
    </TableRow>
  );
};
