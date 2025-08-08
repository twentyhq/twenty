import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { ReactNode } from 'react';

import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { Tag } from 'twenty-ui/components';
import { OverflowingTextWithTooltip, useIcons } from 'twenty-ui/display';
import { Agent } from '~/generated-metadata/graphql';

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

const StyledActionTableCell = styled(TableCell)`
  justify-content: flex-end;
  padding-right: ${({ theme }) => theme.spacing(2)};
`;

const StyledIconContainer = styled.div`
  flex-shrink: 0;
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
        <StyledIconContainer>
          <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        </StyledIconContainer>
        <OverflowingTextWithTooltip text={agent.label} />
      </StyledNameTableCell>
      <TableCell>
        <Tag
          text={agent.isCustom ? 'Custom' : 'Standard'}
          color={agent.isCustom ? 'orange' : 'blue'}
          weight="medium"
        />
      </TableCell>
      <StyledActionTableCell>{action}</StyledActionTableCell>
    </StyledAIAgentTableRow>
  );
};
