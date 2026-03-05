import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { SettingsItemTypeTag } from '@/settings/components/SettingsItemTypeTag';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { OverflowingTextWithTooltip, useIcons } from 'twenty-ui/display';
import {
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from 'twenty-ui/theme-constants';
import { type Agent } from '~/generated-metadata/graphql';

export type SettingsAIAgentTableRowProps = {
  action: ReactNode;
  agent: Agent;
  link?: string;
};

export const AI_AGENT_TABLE_ROW_GRID_TEMPLATE_COLUMNS = '1fr 120px 36px';

const StyledIconContainer = styled.div`
  flex-shrink: 0;
  height: ${themeCssVariables.spacing[4]};
`;

export const SettingsAIAgentTableRow = ({
  action,
  agent,
  link,
}: SettingsAIAgentTableRowProps) => {
  const { getIcon } = useIcons();
  const Icon = getIcon(agent.icon || 'IconRobot');

  return (
    <TableRow
      gridTemplateColumns={AI_AGENT_TABLE_ROW_GRID_TEMPLATE_COLUMNS}
      key={agent.id}
      to={link}
    >
      <TableCell
        color={themeCssVariables.font.color.primary}
        gap={themeCssVariables.spacing[2]}
        minWidth="0"
        overflow="hidden"
      >
        <StyledIconContainer>
          <Icon
            size={resolveThemeVariableAsNumber(themeCssVariables.icon.size.md)}
            stroke={resolveThemeVariableAsNumber(
              themeCssVariables.icon.stroke.sm,
            )}
          />
        </StyledIconContainer>
        <OverflowingTextWithTooltip text={agent.label} />
      </TableCell>
      <TableCell>
        <SettingsItemTypeTag item={agent} />
      </TableCell>
      <TableCell align="right">{action}</TableCell>
    </TableRow>
  );
};
