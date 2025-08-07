import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SettingsRolePermissionsObjectLevelOverrideCellContainer } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsObjectLevelOverrideCellContainer';
import { SettingsRolePermissionsObjectLevelSeeFieldsValueForObject } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsObjectLevelSeeFieldsValueForObject';
import { SettingsRolePermissionsObjectLevelUpdateFieldsValueForObject } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsObjectLevelUpdateFieldsValueForObject';
import { OBJECT_LEVEL_PERMISSION_TABLE_GRID_AUTO_COLUMNS } from '@/settings/roles/role-permissions/object-level-permissions/constants/ObjectLevelPermissionTableGridAutoColumns';
import { SettingsPath } from '@/types/SettingsPath';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  IconChevronRight,
  OverflowingTextWithTooltip,
  useIcons,
} from 'twenty-ui/display';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledNameTableCell = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.primary};
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledNameLabel = styled.div`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

type SettingsRolePermissionsObjectLevelTableRowProps = {
  objectMetadataItem: ObjectMetadataItem;
  roleId: string;
};

export const SettingsRolePermissionsObjectLevelTableRow = ({
  objectMetadataItem,
  roleId,
}: SettingsRolePermissionsObjectLevelTableRowProps) => {
  const { getIcon } = useIcons();
  const theme = useTheme();

  const Icon = getIcon(objectMetadataItem.icon);

  const objectLabelPlural = objectMetadataItem.labelPlural;

  return (
    <TableRow
      to={getSettingsPath(SettingsPath.RoleObjectLevel, {
        roleId: roleId,
        objectMetadataId: objectMetadataItem.id,
      })}
      gridAutoColumns={OBJECT_LEVEL_PERMISSION_TABLE_GRID_AUTO_COLUMNS}
    >
      <StyledNameTableCell>
        {!!Icon && (
          <Icon
            style={{ minWidth: theme.icon.size.md }}
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
          />
        )}
        <StyledNameLabel title={objectLabelPlural}>
          <OverflowingTextWithTooltip text={objectLabelPlural} />
        </StyledNameLabel>
      </StyledNameTableCell>
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
          objectMetadataItemId={objectMetadataItem.id}
        />
      </TableCell>
      <TableCell>
        <SettingsRolePermissionsObjectLevelUpdateFieldsValueForObject
          roleId={roleId}
          objectMetadataItemId={objectMetadataItem.id}
        />
      </TableCell>
      <TableCell align={'right'}>
        <IconChevronRight
          size={theme.icon.size.md}
          color={theme.font.color.tertiary}
        />
      </TableCell>
    </TableRow>
  );
};
