import { styled } from '@linaria/react';
import { type LogicFunction } from '~/generated-metadata/graphql';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { IconChevronRight } from 'twenty-ui/display';
import { LOGIC_FUNCTIONS_TABLE_ROW_GRID_TEMPLATE_COLUMNS } from '@/settings/logic-functions/components/SettingsLogicFunctionsTable';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import {
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from 'twenty-ui/theme-constants';

const StyledIconChevronRightContainer = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
`;

export const SettingsLogicFunctionsFieldItemTableRow = ({
  logicFunction,
  to,
}: {
  logicFunction: LogicFunction;
  to: string;
}) => {
  return (
    <TableRow
      gridTemplateColumns={LOGIC_FUNCTIONS_TABLE_ROW_GRID_TEMPLATE_COLUMNS}
      to={to}
    >
      <TableCell
        color={themeCssVariables.font.color.primary}
        gap={themeCssVariables.spacing[2]}
      >
        {logicFunction.name}
      </TableCell>
      <TableCell
        color={themeCssVariables.font.color.primary}
        gap={themeCssVariables.spacing[2]}
      />
      <TableCell
        color={themeCssVariables.font.color.secondary}
        gap={themeCssVariables.spacing[2]}
      >
        {logicFunction.runtime}
      </TableCell>
      <TableCell
        align="center"
        padding={`0 ${themeCssVariables.spacing[1]} 0 ${themeCssVariables.spacing[2]}`}
      >
        <StyledIconChevronRightContainer>
          <IconChevronRight
            size={resolveThemeVariableAsNumber(themeCssVariables.icon.size.md)}
            stroke={resolveThemeVariableAsNumber(
              themeCssVariables.icon.stroke.sm,
            )}
          />
        </StyledIconChevronRightContainer>
      </TableCell>
    </TableRow>
  );
};
