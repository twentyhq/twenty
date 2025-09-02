import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { OverflowingTextWithTooltip, useIcons } from 'twenty-ui/display';
import { type Agent } from '~/generated-metadata/graphql';

const StyledIconWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
`;

const StyledNameCell = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  flex: 1;
  min-width: 0;
`;

const StyledNameContainer = styled.div`
  align-items: center;
  display: flex;
  overflow: hidden;
  width: 100%;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledTableCell = styled(TableCell)`
  overflow: hidden;
`;

type SettingsRoleAssignmentAgentTableRowProps = {
  agent: Agent;
};

export const SettingsRoleAssignmentAgentTableRow = ({
  agent,
}: SettingsRoleAssignmentAgentTableRowProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const Icon = getIcon(agent.icon || 'IconRobot');

  return (
    <TableRow gridAutoColumns="2fr 4fr">
      <StyledTableCell>
        <StyledNameContainer>
          <StyledIconWrapper>
            <Icon size={theme.icon.size.md} />
          </StyledIconWrapper>
          <StyledNameCell>
            <OverflowingTextWithTooltip text={agent.label} />
          </StyledNameCell>
        </StyledNameContainer>
      </StyledTableCell>
      <StyledTableCell>
        <OverflowingTextWithTooltip text={agent.description} />
      </StyledTableCell>
    </TableRow>
  );
};
