import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconCheck, IconFilter, useIcons } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { type ObjectAccessOverviewRoleDto } from '~/generated-metadata/graphql';

type ObjectAccessRolesTableProps = {
  roles: ObjectAccessOverviewRoleDto[];
};

const GRID_AUTO_COLUMNS = '3fr 1fr 1fr 1fr 2fr 1.5fr';

const StyledNameCell = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledRowFilterCell = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledTableRowContainer = styled.div`
  > * {
    &:hover {
      background: ${themeCssVariables.background.transparent.light};
      cursor: pointer;
    }
  }
`;

export const ObjectAccessRolesTable = ({
  roles,
}: ObjectAccessRolesTableProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { getIcon } = useIcons();

  const renderAllowed = (isAllowed: boolean) =>
    isAllowed ? (
      <IconCheck size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
    ) : (
      '-'
    );

  return (
    <Table>
      <TableRow gridAutoColumns={GRID_AUTO_COLUMNS}>
        <TableHeader>{t`Role`}</TableHeader>
        <TableHeader align="center">{t`View`}</TableHeader>
        <TableHeader align="center">{t`Edit`}</TableHeader>
        <TableHeader align="center">{t`Delete`}</TableHeader>
        <TableHeader>{t`Row filter`}</TableHeader>
        <TableHeader align="center">{t`All records`}</TableHeader>
      </TableRow>
      {roles.map((role) => {
        const RoleIcon = getIcon(role.icon ?? 'IconUser');

        return (
          <StyledTableRowContainer key={role.id}>
            <TableRow
              gridAutoColumns={GRID_AUTO_COLUMNS}
              to={getSettingsPath(SettingsPath.RoleDetail, {
                roleId: role.id,
              })}
            >
              <TableCell>
                <StyledNameCell>
                  <RoleIcon
                    size={theme.icon.size.md}
                    stroke={theme.icon.stroke.sm}
                  />
                  {role.label}
                </StyledNameCell>
              </TableCell>
              <TableCell
                align="center"
                color={themeCssVariables.font.color.tertiary}
              >
                {renderAllowed(role.canRead)}
              </TableCell>
              <TableCell
                align="center"
                color={themeCssVariables.font.color.tertiary}
              >
                {renderAllowed(role.canUpdate)}
              </TableCell>
              <TableCell
                align="center"
                color={themeCssVariables.font.color.tertiary}
              >
                {renderAllowed(role.canSoftDelete)}
              </TableCell>
              <TableCell color={themeCssVariables.font.color.tertiary}>
                {role.hasRowFilter ? (
                  <StyledRowFilterCell>
                    <IconFilter
                      size={theme.icon.size.sm}
                      stroke={theme.icon.stroke.sm}
                    />
                    {t`Some records`}
                  </StyledRowFilterCell>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell
                align="center"
                color={themeCssVariables.font.color.tertiary}
              >
                {renderAllowed(role.canAccessAllRecords)}
              </TableCell>
            </TableRow>
          </StyledTableRowContainer>
        );
      })}
    </Table>
  );
};
