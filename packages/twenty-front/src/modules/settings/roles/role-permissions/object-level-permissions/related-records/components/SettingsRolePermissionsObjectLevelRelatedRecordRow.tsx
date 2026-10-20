import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { useApplicationChipData } from '@/applications/hooks/useApplicationChipData';
import { RELATED_RECORDS_TABLE_GRID_TEMPLATE_COLUMNS } from '@/settings/roles/role-permissions/object-level-permissions/related-records/constants/RelatedRecordsTableGridTemplateColumns';
import { type SettingsRoleRelatedRecordsRule } from '@/settings/roles/role-permissions/object-level-permissions/related-records/types/SettingsRoleRelatedRecordsRule';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconButton } from 'twenty-ui/components/input';
import { IconLock, IconTrash } from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledNameLabel = styled.div`
  min-width: 0;
  overflow: hidden;
`;

const StyledAppLabel = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  white-space: nowrap;
`;

type SettingsRolePermissionsObjectLevelRelatedRecordRowProps = {
  rule: SettingsRoleRelatedRecordsRule;
  isLocked: boolean;
  isEditable: boolean;
  onRemove: () => void;
};

export const SettingsRolePermissionsObjectLevelRelatedRecordRow = ({
  rule: { childObjectMetadataItem, relationLabel, relationKind },
  isLocked,
  isEditable,
  onRemove,
}: SettingsRolePermissionsObjectLevelRelatedRecordRowProps) => {
  const theme = useTheme();

  const { applicationChipData } = useApplicationChipData({
    applicationId: childObjectMetadataItem.applicationId ?? '',
  });

  return (
    <TableRow gridTemplateColumns={RELATED_RECORDS_TABLE_GRID_TEMPLATE_COLUMNS}>
      <TableCell
        color={themeCssVariables.font.color.primary}
        gap={themeCssVariables.spacing[1]}
      >
        <ObjectMetadataIcon
          objectMetadataItem={childObjectMetadataItem}
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
        />
        <StyledNameLabel>
          <OverflowingTextWithTooltip
            text={childObjectMetadataItem.labelPlural}
          />
        </StyledNameLabel>
        {isLocked && (
          <StyledAppLabel>
            {` · ${applicationChipData.name}`}
            <IconLock size={theme.icon.size.sm} />
          </StyledAppLabel>
        )}
      </TableCell>
      <TableCell>
        <StyledNameLabel>
          <OverflowingTextWithTooltip text={relationLabel} />
        </StyledNameLabel>
      </TableCell>
      <TableCell>
        {relationKind === 'MANY_TO_MANY' ? t`Many-to-many` : t`Belongs to one`}
      </TableCell>
      <TableCell align="right" padding={`0 ${themeCssVariables.spacing[1]}`}>
        {!isLocked && (
          <IconButton
            aria-label={t`Remove related records rule`}
            variant="ghost"
            size="sm"
            disabled={!isEditable}
            onClick={onRemove}
          >
            <IconTrash />
          </IconButton>
        )}
      </TableCell>
    </TableRow>
  );
};
