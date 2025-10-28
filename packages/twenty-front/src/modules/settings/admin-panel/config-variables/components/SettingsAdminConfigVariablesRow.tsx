import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconChevronRight } from 'twenty-ui/display';
import { type ConfigVariable } from '~/generated/graphql';

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

  return (
    <StyledTableRow
      gridAutoColumns="5fr 3fr 1fr"
      to={getSettingsPath(SettingsPath.AdminPanelConfigVariableDetails, {
        variableName: variable.name,
      })}
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
