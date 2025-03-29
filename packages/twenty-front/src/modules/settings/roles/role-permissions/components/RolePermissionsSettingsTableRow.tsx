import { RolePermissionsSettingPermission } from '@/settings/roles/types/RolePermissionsSettingPermission';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Checkbox } from 'twenty-ui';

const StyledName = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledDescription = styled(StyledName)`
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StyledPermissionCell = styled(TableCell)`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledCheckboxCell = styled(TableCell)`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  padding-right: ${({ theme }) => theme.spacing(4)};
`;

const StyledIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

type RolePermissionsSettingsTableRowProps = {
  permission: RolePermissionsSettingPermission;
};

export const RolePermissionsSettingsTableRow = ({
  permission,
}: RolePermissionsSettingsTableRowProps) => {
  const theme = useTheme();

  return (
    <TableRow key={permission.key} gridAutoColumns="3fr 4fr 24px">
      <StyledPermissionCell>
        <StyledIconContainer>
          <permission.Icon
            size={16}
            color={theme.font.color.primary}
            stroke={theme.icon.stroke.sm}
          />
        </StyledIconContainer>
        <StyledName>{permission.name}</StyledName>
      </StyledPermissionCell>
      <StyledPermissionCell>
        <StyledDescription>{permission.description}</StyledDescription>
      </StyledPermissionCell>
      <StyledCheckboxCell>
        <Checkbox checked={permission.value} disabled />
      </StyledCheckboxCell>
    </TableRow>
  );
};
