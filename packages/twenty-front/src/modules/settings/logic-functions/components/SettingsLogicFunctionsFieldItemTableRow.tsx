import { styled } from '@linaria/react';
import { type LogicFunction } from '~/generated-metadata/graphql';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import {
  IconChevronRight,
  IconCode,
  OverflowingTextWithTooltip,
} from 'twenty-ui/display';
import { StyledTableRow } from '@/settings/logic-functions/components/SettingsLogicFunctionsTable';
import { useContext } from 'react';
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
  to,
}: {
  logicFunction: LogicFunction;
  to: string;
}) => {
  const { theme } = useContext(ThemeContext);

  const computeTrigger = () => {
    const cronTrigger = logicFunction.cronTriggerSettings;

    const routeTrigger = logicFunction.httpRouteTriggerSettings;

    const databaseEventTriggerSettings =
      logicFunction.databaseEventTriggerSettings;

    const isTool = logicFunction.isTool;

    if (isTool) {
      return 'Tool';
    }

    if (cronTrigger) {
      return 'Cron';
    }

    if (routeTrigger) {
      return 'Route';
    }

    if (databaseEventTriggerSettings) {
      return databaseEventTriggerSettings.eventName;
    }

    return '';
  };
  return (
    <StyledTableRow to={to}>
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
        <OverflowingTextWithTooltip text={computeTrigger()} />
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
