import { SettingsPath } from '@/types/SettingsPath';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Link } from 'react-router-dom';
import { IconChevronRight } from 'twenty-ui/display';
import { ConfigVariable } from '~/generated/graphql';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

type SettingsAdminConfigVariablesRowProps = {
  variable: ConfigVariable;
  isExpanded: boolean;
  onExpandToggle: (name: string) => void;
};

const StyledTruncatedCell = styled(TableCell)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
`;

const StyledEllipsisLabel = styled.div`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const StyledTableRow = styled(TableRow)<{ isExpanded: boolean }>`
  background-color: ${({ isExpanded, theme }) =>
    isExpanded ? theme.background.transparent.light : 'transparent'};
`;

const StyledLink = styled(Link)`
  text-decoration: none;
`;

export const SettingsAdminConfigVariablesRow = ({
  variable,
  isExpanded,
  onExpandToggle,
}: SettingsAdminConfigVariablesRowProps) => {
  const theme = useTheme();

  const displayValue =
    variable.value === ''
      ? 'null'
      : variable.isSensitive
        ? '••••••'
        : variable.value;

  return (
    <StyledLink
      to={getSettingsPath(SettingsPath.AdminPanelConfigVariableDetails, {
        variableName: variable.name,
      })}
    >
      <StyledTableRow
        onClick={() => onExpandToggle(variable.name)}
        gridAutoColumns="5fr 4fr 3fr 1fr"
        isExpanded={isExpanded}
      >
        <StyledTruncatedCell color={theme.font.color.primary}>
          <StyledEllipsisLabel>{variable.name}</StyledEllipsisLabel>
        </StyledTruncatedCell>
        <StyledTruncatedCell>
          <StyledEllipsisLabel>{variable.description}</StyledEllipsisLabel>
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
    </StyledLink>
  );
};
