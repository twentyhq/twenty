import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconChevronRight } from 'twenty-ui/display';
import { useContext } from 'react';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { type ConfigVariable } from '~/generated-metadata/graphql';

type SettingsAdminConfigVariablesRowProps = {
  variable: ConfigVariable;
};

const StyledTableRowContainer = styled.div`
  > * {
    &:hover {
      background-color: ${themeCssVariables.background.transparent.light};
    }
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
  const { theme } = useContext(ThemeContext);

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
    <StyledTableRowContainer>
      <TableRow
        gridAutoColumns="5fr 3fr 1fr"
        to={getSettingsPath(SettingsPath.AdminPanelConfigVariableDetails, {
          variableName: variable.name,
        })}
      >
        <TableCell
          color={theme.font.color.primary}
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
          clickable
        >
          <StyledEllipsisLabel>{variable.name}</StyledEllipsisLabel>
        </TableCell>
        <TableCell
          align="right"
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
          clickable
        >
          <StyledEllipsisLabel>{displayValue}</StyledEllipsisLabel>
        </TableCell>
        <TableCell align="right">
          <IconChevronRight
            size={theme.icon.size.md}
            color={theme.font.color.tertiary}
          />
        </TableCell>
      </TableRow>
    </StyledTableRowContainer>
  );
};
