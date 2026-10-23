import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsRolePermissionsObjectLevelOverrideCellContainer } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsObjectLevelOverrideCellContainer';
import { SettingsRolePermissionsObjectLevelSeeFieldsValueForObject } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsObjectLevelSeeFieldsValueForObject';
import { SettingsRolePermissionsObjectLevelTableRowOptionsDropdown } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsObjectLevelTableRowOptionsDropdown';
import { SettingsRolePermissionsObjectLevelUpdateFieldsValueForObject } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsObjectLevelUpdateFieldsValueForObject';
import { OBJECT_LEVEL_PERMISSION_TABLE_GRID_AUTO_COLUMNS } from '@/settings/roles/role-permissions/object-level-permissions/constants/ObjectLevelPermissionTableGridAutoColumns';
import { useObjectPermissionDerivedStates } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/hooks/useObjectPermissionDerivedStates';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconFilter } from 'twenty-ui/icon';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

const StyledNameLabel = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledRecordLevelPermissionIndicator = styled.div`
  display: flex;
`;

type SettingsRolePermissionsObjectLevelTableRowProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  roleId: string;
  isEditable?: boolean;
  fromAgentId?: string;
  canRemoveRecordLevelPermissionRules: boolean;
};

export const SettingsRolePermissionsObjectLevelTableRow = ({
  objectMetadataItem,
  roleId,
  isEditable = true,
  fromAgentId,
  canRemoveRecordLevelPermissionRules,
}: SettingsRolePermissionsObjectLevelTableRowProps) => {
  const theme = useTheme();
  const objectLabelPlural = objectMetadataItem.labelPlural;
  const recordLevelRulesLabel = t`Record-level rules`;

  const { isThereAnyRowLevelPermissionPredicateForThisObject } =
    useObjectPermissionDerivedStates({
      roleId,
      objectMetadataItemId: objectMetadataItem.id,
    });

  const navigationPath = getSettingsPath(SettingsPath.RoleObjectLevel, {
    roleId: roleId,
    objectMetadataId: objectMetadataItem.id,
  });

  const navigationUrl = fromAgentId
    ? `${navigationPath}?fromAgent=${fromAgentId}`
    : navigationPath;

  return (
    <TableRow
      to={isEditable ? navigationUrl : undefined}
      gridAutoColumns={OBJECT_LEVEL_PERMISSION_TABLE_GRID_AUTO_COLUMNS}
    >
      <TableCell
        color={themeCssVariables.font.color.primary}
        gap={themeCssVariables.spacing[1]}
      >
        <ObjectMetadataIcon
          objectMetadataItem={objectMetadataItem}
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
        />
        <StyledNameLabel title={objectLabelPlural}>
          <OverflowingTextWithTooltip text={objectLabelPlural} />
        </StyledNameLabel>
      </TableCell>
      <TableCell>
        <SettingsRolePermissionsObjectLevelOverrideCellContainer
          objectMetadataItem={objectMetadataItem}
          roleId={roleId}
          objectLabel={objectLabelPlural}
        />
      </TableCell>
      <TableCell>
        <SettingsRolePermissionsObjectLevelSeeFieldsValueForObject
          roleId={roleId}
          objectMetadataItem={objectMetadataItem}
        />
      </TableCell>
      <TableCell>
        <SettingsRolePermissionsObjectLevelUpdateFieldsValueForObject
          roleId={roleId}
          objectMetadataItem={objectMetadataItem}
        />
      </TableCell>
      <TableCell>
        {isThereAnyRowLevelPermissionPredicateForThisObject && (
          <Tooltip
            content={recordLevelRulesLabel}
            delay={TooltipDelay.shortDelay}
            side="bottom"
            positionMethod="fixed"
          >
            <StyledRecordLevelPermissionIndicator
              role="img"
              aria-label={recordLevelRulesLabel}
            >
              <IconFilter
                size={theme.icon.size.md}
                stroke={theme.icon.stroke.sm}
              />
            </StyledRecordLevelPermissionIndicator>
          </Tooltip>
        )}
      </TableCell>
      <TableCell
        align="right"
        padding={`0 ${themeCssVariables.spacing[1]} 0 ${themeCssVariables.spacing[2]}`}
      >
        <SettingsRolePermissionsObjectLevelTableRowOptionsDropdown
          roleId={roleId}
          objectMetadataId={objectMetadataItem.id}
          objectPermissionDetailUrl={navigationUrl}
          isEditable={isEditable}
          canRemoveRecordLevelPermissionRules={
            canRemoveRecordLevelPermissionRules
          }
        />
      </TableCell>
    </TableRow>
  );
};
