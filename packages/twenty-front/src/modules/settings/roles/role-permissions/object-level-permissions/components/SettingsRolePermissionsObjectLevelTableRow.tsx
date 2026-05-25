import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsRolePermissionsObjectLevelOverrideCellContainer } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsObjectLevelOverrideCellContainer';
import { SettingsRolePermissionsObjectLevelSeeFieldsValueForObject } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsObjectLevelSeeFieldsValueForObject';
import { SettingsRolePermissionsObjectLevelTableRowOptionsDropdown } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsObjectLevelTableRowOptionsDropdown';
import { SettingsRolePermissionsObjectLevelUpdateFieldsValueForObject } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsObjectLevelUpdateFieldsValueForObject';
import { OBJECT_LEVEL_PERMISSION_TABLE_GRID_AUTO_COLUMNS } from '@/settings/roles/role-permissions/object-level-permissions/constants/ObjectLevelPermissionTableGridAutoColumns';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledNameLabel = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type SettingsRolePermissionsObjectLevelTableRowProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  roleId: string;
  isEditable?: boolean;
  fromAgentId?: string;
};

export const SettingsRolePermissionsObjectLevelTableRow = ({
  objectMetadataItem,
  roleId,
  isEditable = true,
  fromAgentId,
}: SettingsRolePermissionsObjectLevelTableRowProps) => {
  const { theme } = useContext(ThemeContext);
  const objectLabelPlural = objectMetadataItem.labelPlural;
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
      <TableCell></TableCell>
      <TableCell
        align="right"
        padding={`0 ${themeCssVariables.spacing[1]} 0 ${themeCssVariables.spacing[2]}`}
      >
        <SettingsRolePermissionsObjectLevelTableRowOptionsDropdown
          roleId={roleId}
          objectMetadataId={objectMetadataItem.id}
          objectPermissionDetailUrl={navigationUrl}
          isEditable={isEditable}
        />
      </TableCell>
    </TableRow>
  );
};
