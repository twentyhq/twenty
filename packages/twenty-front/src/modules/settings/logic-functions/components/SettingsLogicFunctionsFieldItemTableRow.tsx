import {
  type LogicFunctionTableRow,
  StyledTableRow,
} from '@/settings/logic-functions/components/SettingsLogicFunctionsTable';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import {
  IconChevronRight,
  IconCode,
  OverflowingTextWithTooltip,
} from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledIconContainer = styled.span`
  align-items: center;
  display: flex;
`;

const StyledIconChevronRightContainer = styled(StyledIconContainer)`
  color: ${themeCssVariables.font.color.tertiary};
`;

export const SettingsLogicFunctionsFieldItemTableRow = ({
  logicFunction,
}: {
  logicFunction: LogicFunctionTableRow;
}) => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledTableRow to={logicFunction.link}>
      <TableCell
        color={themeCssVariables.font.color.primary}
        gap={themeCssVariables.spacing[2]}
      >
        <StyledIconContainer>
          <IconCode size={theme.icon.size.md} />
        </StyledIconContainer>
        <OverflowingTextWithTooltip text={logicFunction.name} />
      </TableCell>
      <TableCell
        color={themeCssVariables.font.color.secondary}
        gap={themeCssVariables.spacing[2]}
        align={'right'}
        whiteSpace="nowrap"
        overflow="hidden"
      >
        <OverflowingTextWithTooltip text={logicFunction.trigger} />
      </TableCell>
      <TableCell
        align="center"
        padding={`0 ${themeCssVariables.spacing[1]} 0 ${themeCssVariables.spacing[2]}`}
      >
        {logicFunction.link && (
          <StyledIconChevronRightContainer>
            <IconChevronRight
              size={theme.icon.size.md}
              stroke={theme.icon.stroke.sm}
            />
          </StyledIconChevronRightContainer>
        )}
      </TableCell>
    </StyledTableRow>
  );
};
