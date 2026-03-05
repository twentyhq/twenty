import { styled } from '@linaria/react';
import { type LogicFunction } from '~/generated-metadata/graphql';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { IconChevronRight } from 'twenty-ui/display';
import { StyledTableRow } from '@/settings/logic-functions/components/SettingsLogicFunctionsTable';
import { useContext } from 'react';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledNameTableCell = styled(TableCell)`
  color: ${themeCssVariables.font.color.primary};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledRuntimeTableCell = styled(TableCell)`
  color: ${themeCssVariables.font.color.secondary};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledIconTableCell = styled(TableCell)`
  justify-content: center;
  padding-right: ${themeCssVariables.spacing[1]};
`;

const StyledIconChevronRight = styled(IconChevronRight)`
  color: ${themeCssVariables.font.color.tertiary};
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
      <StyledNameTableCell>{logicFunction.name}</StyledNameTableCell>
      <StyledNameTableCell></StyledNameTableCell>
      <StyledRuntimeTableCell>{logicFunction.runtime}</StyledRuntimeTableCell>
      <StyledIconTableCell>
        <StyledIconChevronRight
          size={parseFloat(theme.icon.size.md)}
          stroke={parseFloat(theme.icon.stroke.sm)}
        />
      </StyledIconTableCell>
    </StyledTableRow>
  );
};
