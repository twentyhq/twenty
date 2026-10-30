import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Fragment } from 'react';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconChevronRight, IconTrash, useIcons } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { RELATED_RECORD_PATH_TABLE_GRID_TEMPLATE_COLUMNS } from '@/related-record-paths/constants/RelatedRecordPathTableGridTemplateColumns';
import { getRelatedRecordPathFieldMetadataIds } from '@/related-record-paths/utils/getRelatedRecordPathFieldMetadataIds';
import { getRelatedRecordPathSteps } from '@/related-record-paths/utils/getRelatedRecordPathSteps';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { type RelatedRecordPath } from '~/generated-metadata/graphql';

const StyledInlineContent = styled.span`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledHop = styled.span`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledSeparator = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
`;

type SettingsObjectRelatedRecordPathTableRowProps = {
  sourceObjectMetadataItem: EnrichedObjectMetadataItem;
  relatedRecordPath: RelatedRecordPath;
  isReadOnly: boolean;
  isDeleteDisabled: boolean;
  onDelete: (relatedRecordPathId: string) => void;
};

export const SettingsObjectRelatedRecordPathTableRow = ({
  sourceObjectMetadataItem,
  relatedRecordPath,
  isReadOnly,
  isDeleteDisabled,
  onDelete,
}: SettingsObjectRelatedRecordPathTableRowProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { getIcon } = useIcons();
  const { objectMetadataItems } = useObjectMetadataItems();

  const steps = getRelatedRecordPathSteps({
    sourceObjectMetadataItem,
    fieldMetadataIds: getRelatedRecordPathFieldMetadataIds(relatedRecordPath),
    objectMetadataItems,
  });
  const reachedObjectMetadataItem = steps.at(-1)?.targetObjectMetadataItem;

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
      <TableCell>
        <StyledInlineContent>
          {steps.map(({ fieldMetadataItem }, index) => {
            const FieldIcon = getIcon(fieldMetadataItem.icon);

            return (
              <Fragment key={fieldMetadataItem.id}>
                {index > 0 && (
                  <StyledSeparator>
                    <IconChevronRight size={theme.icon.size.sm} />
                  </StyledSeparator>
                )}
                <StyledHop>
                  <FieldIcon size={theme.icon.size.sm} />
                  {fieldMetadataItem.label}
                </StyledHop>
              </Fragment>
            );
          })}
        </StyledInlineContent>
      </TableCell>
      <TableCell>
        {relatedRecordPath.isInherent ? t`Inherent` : t`Regular`}
      </TableCell>
      <TableCell align="center">
        {!isReadOnly && (
          <LightIconButton
            emphasis="subtle"
            disabled={isDeleteDisabled}
            aria-label={t`Delete related record path`}
            onClick={() => onDelete(relatedRecordPath.id)}
          >
            <IconTrash />
          </LightIconButton>
        )}
      </TableCell>
    </TableRow>
  );
};
