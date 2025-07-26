import { CONFIG_VARIABLE_ROW_ID_PREFIX } from '@/settings/admin-panel/config-variables/constants/ConfigVariableRowId';
import { lastVisitedConfigVariableState } from '@/settings/admin-panel/config-variables/states/lastVisitedConfigVariableState';
import { SettingsPath } from '@/types/SettingsPath';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useSetRecoilState } from 'recoil';
import { IconChevronRight } from 'twenty-ui/display';
import { ConfigVariable } from '~/generated/graphql';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

type SettingsAdminConfigVariablesRowProps = {
  variable: ConfigVariable;
};

const StyledTruncatedCell = styled(TableCell)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
`;

const StyledTableRow = styled(TableRow)`
  &:hover {
    background-color: ${({ theme }) => theme.background.transparent.light};
  }
`;

const StyledEllipsisLabel = styled.div`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

export const SettingsAdminConfigVariablesRow = ({
  variable,
}: SettingsAdminConfigVariablesRowProps) => {
  const theme = useTheme();
  const setLastVisitedConfigVariable = useSetRecoilState(
    lastVisitedConfigVariableState,
  );

  const displayValue =
    variable.value === ''
      ? 'null'
      : variable.isSensitive
        ? '••••••'
        : typeof variable.value === 'boolean'
          ? variable.value
            ? 'true'
            : 'false'
          : variable.value;

  const handleRowClick = () => {
    setLastVisitedConfigVariable(variable.name);
  };

  return (
    <StyledTableRow
      gridAutoColumns="5fr 3fr 1fr"
      to={getSettingsPath(SettingsPath.AdminPanelConfigVariableDetails, {
        variableName: variable.name,
      })}
      onClick={handleRowClick}
      id={`${CONFIG_VARIABLE_ROW_ID_PREFIX}-${variable.name}`}
    >
      <StyledTruncatedCell color={theme.font.color.primary}>
        <StyledEllipsisLabel>{variable.name}</StyledEllipsisLabel>
      </StyledTruncatedCell>
      <StyledTruncatedCell align="right">
        <StyledEllipsisLabel>{displayValue}</StyledEllipsisLabel>
      </StyledTruncatedCell>
      <TableCell align="right">
        <IconChevronRight
          size={theme.icon.size.md}
          color={theme.font.color.tertiary}
        />
      </TableCell>
    </StyledTableRow>
  );
};
