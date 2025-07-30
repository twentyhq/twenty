import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { ReactNode } from 'react';

import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useIcons } from 'twenty-ui/display';
import { SettingsAIAgentTableItem } from '~/pages/settings/ai/types/SettingsAIAgentTableItem';
import { SettingsAIAgentTypeTag } from './SettingsAIAgentTypeTag';

export type SettingsAIAgentTableRowProps = {
  action: ReactNode;
  agent: SettingsAIAgentTableItem;
  link?: string;
};

export const StyledAIAgentTableRow = styled(TableRow)`
  grid-template-columns: 300px 120px 36px;
`;

const StyledNameTableCell = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.primary};
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledNameLabel = styled.div`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const StyledActionTableCell = styled(TableCell)`
  justify-content: center;
  padding-right: ${({ theme }) => theme.spacing(1)};
`;



export const SettingsAIAgentTableRow = ({
  action,
  agent,
  link,
}: SettingsAIAgentTableRowProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const Icon = getIcon(agent.icon);

  return (
    <StyledAIAgentTableRow key={agent.id} to={link}>
      <StyledNameTableCell>
        {!!Icon && (
          <Icon
            style={{ minWidth: theme.icon.size.md }}
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
          />
        )}
        <StyledNameLabel title={agent.name}>{agent.name}</StyledNameLabel>
      </StyledNameTableCell>
      <TableCell>
        <SettingsAIAgentTypeTag type={agent.type} />
      </TableCell>
      <StyledActionTableCell>{action}</StyledActionTableCell>
    </StyledAIAgentTableRow>
  );
};
