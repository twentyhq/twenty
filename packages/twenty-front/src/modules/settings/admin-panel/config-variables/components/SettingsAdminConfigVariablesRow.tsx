import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { SettingsPath } from 'twenty-shared/types';

import { getSettingsPath } from 'twenty-shared/utils';
import { IconChevronRight } from 'twenty-ui/display';
import {
  resolveThemeVariable,
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from 'twenty-ui/theme-constants';
import { type ConfigVariable } from '~/generated-metadata/graphql';

type SettingsAdminConfigVariablesRowProps = {
  variable: ConfigVariable;
};

const StyledEllipsisLabel = styled.div`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

export const SettingsAdminConfigVariablesRow = ({
  variable,
}: SettingsAdminConfigVariablesRowProps) => {
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
    <TableRow
      gridAutoColumns="5fr 3fr 1fr"
      to={getSettingsPath(SettingsPath.AdminPanelConfigVariableDetails, {
        variableName: variable.name,
      })}
      hoverBackgroundColor={themeCssVariables.background.transparent.light}
    >
      <TableCell
        whiteSpace="nowrap"
        overflow="hidden"
        textOverflow="ellipsis"
        clickable
        color={resolveThemeVariable(themeCssVariables.font.color.primary)}
      >
        <StyledEllipsisLabel>{variable.name}</StyledEllipsisLabel>
      </TableCell>
      <TableCell
        whiteSpace="nowrap"
        overflow="hidden"
        textOverflow="ellipsis"
        clickable
        align="right"
      >
        <StyledEllipsisLabel>{displayValue}</StyledEllipsisLabel>
      </TableCell>
      <TableCell align="right">
        <IconChevronRight
          size={resolveThemeVariableAsNumber(themeCssVariables.icon.size.md)}
          color={resolveThemeVariable(themeCssVariables.font.color.tertiary)}
        />
      </TableCell>
    </TableRow>
  );
};
