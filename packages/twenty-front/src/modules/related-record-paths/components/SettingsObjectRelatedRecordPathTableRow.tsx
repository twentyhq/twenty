import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Fragment } from 'react';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconChevronRight, IconTrash } from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
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

const StyledInlineIcon = styled.span<{ isSeparator?: boolean }>`
  color: ${({ isSeparator }) =>
    isSeparator ? themeCssVariables.font.color.tertiary : 'inherit'};
  display: inline-flex;
  margin: ${({ isSeparator }) =>
    isSeparator
      ? `0 ${themeCssVariables.spacing[1]}`
      : `0 ${themeCssVariables.spacing[1]} 0 0`};
  vertical-align: middle;
`;

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
    .join(' > ');

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
        <OverflowingTextWithTooltip
          tooltipContent={relationLabel}
          text={steps.map(({ fieldMetadataItem }, index) => {
            const FieldIcon = getIcon(fieldMetadataItem.icon);

            return (
              <Fragment key={fieldMetadataItem.id}>
                {index > 0 && (
                  <StyledInlineIcon isSeparator>
                    <IconChevronRight size={theme.icon.size.sm} />
                  </StyledInlineIcon>
                )}
                <StyledInlineIcon>
                  <FieldIcon size={theme.icon.size.sm} />
                </StyledInlineIcon>
                <span>{fieldMetadataItem.label}</span>
              </Fragment>
            );
          })}
        />
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
