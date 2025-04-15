import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SettingsRolePermissionsObjectLevelOverrideCell } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsObjectLevelOverrideCell';
import { SettingsPath } from '@/types/SettingsPath';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconChevronRight, useIcons } from 'twenty-ui/display';
import { ObjectPermission } from '~/generated/graphql';
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
  objectPermission: ObjectPermission;
  objectMetadataItem: ObjectMetadataItem;
};

export const SettingsRolePermissionsObjectLevelTableRow = ({
  objectPermission,
  objectMetadataItem,
}: SettingsRolePermissionsObjectLevelTableRowProps) => {
  const { getIcon } = useIcons();
  const theme = useTheme();

  if (!objectMetadataItem) {
    throw new Error('Object metadata item not found');
  }

  const Icon = getIcon(objectMetadataItem.icon);

  return (
    <TableRow
      to={getSettingsPath(SettingsPath.RoleObjectLevel, {
        roleId: objectPermission.roleId,
        objectMetadataId: objectPermission.objectMetadataId,
      })}
    >
      <StyledNameTableCell>
        {!!Icon && (
          <Icon
            style={{ minWidth: theme.icon.size.md }}
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
          />
        )}
        <StyledNameLabel title={objectMetadataItem.labelPlural}>
          {objectMetadataItem.labelPlural}
        </StyledNameLabel>
      </StyledNameTableCell>
      <TableCell>
        <SettingsRolePermissionsObjectLevelOverrideCell
          objectPermission={objectPermission}
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
