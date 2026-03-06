import { styled } from '@linaria/react';
import { type LogicFunction } from '~/generated-metadata/graphql';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { IconChevronRight } from 'twenty-ui/display';
import { StyledTableRow } from '@/settings/logic-functions/components/SettingsLogicFunctionsTable';
import { useContext } from 'react';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledIconChevronRightContainer = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
`;

export const SettingsLogicFunctionsFieldItemTableRow = ({
  logicFunction,
  to,
}: {
  logicFunction: LogicFunction;
  to: string;
}) => {
  const { theme } = useContext(ThemeContext);
  return (
    <StyledTableRow to={to}>
      <TableCell
        color={themeCssVariables.font.color.primary}
        gap={themeCssVariables.spacing[2]}
      >
        {logicFunction.name}
      </TableCell>
      <TableCell
        color={themeCssVariables.font.color.primary}
        gap={themeCssVariables.spacing[2]}
      ></TableCell>
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
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
          />
        </StyledIconChevronRightContainer>
      </TableCell>
    </StyledTableRow>
  );
};
