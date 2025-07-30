import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { ReactNode } from 'react';

import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useIcons } from 'twenty-ui/display';
import { Agent } from '~/generated-metadata/graphql';
import { SettingsAIAgentTypeTag } from './SettingsAIAgentTypeTag';

export type SettingsAIAgentTableRowProps = {
  action: ReactNode;
  agent: Agent;
  link?: string;
};

export const StyledAIAgentTableRow = styled(TableRow)`
  grid-template-columns: 1fr 120px 36px;
`;

const StyledNameTableCell = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.primary};
  gap: ${({ theme }) => theme.spacing(2)};
  min-width: 0;
  overflow: hidden;
`;

const StyledNameLabel = styled.div`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  min-width: 0;
  flex: 1;
`;

const StyledActionTableCell = styled(TableCell)`
  justify-content: flex-end;
  padding-right: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsAIAgentTableRow = ({
  action,
  agent,
  link,
}: SettingsAIAgentTableRowProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const Icon = getIcon(agent.icon || 'IconRobot');

  return (
    <StyledAIAgentTableRow key={agent.id} to={link}>
      <StyledNameTableCell>
        {!!Icon && (
          <Icon
            style={{ minWidth: theme.icon.size.md, flexShrink: 0 }}
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
          />
        )}
        <StyledNameLabel title={agent.name}>{agent.name}</StyledNameLabel>
      </StyledNameTableCell>
      <TableCell>
        <SettingsAIAgentTypeTag isCustom={agent.isCustom} />
      </TableCell>
      <StyledActionTableCell>{action}</StyledActionTableCell>
    </StyledAIAgentTableRow>
  );
};
