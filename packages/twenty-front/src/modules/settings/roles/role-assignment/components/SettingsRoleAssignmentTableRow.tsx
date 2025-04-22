import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { WorkspaceMember } from '~/generated-metadata/graphql';
import { Avatar, OverflowingTextWithTooltip } from 'twenty-ui/display';

const StyledIconWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  margin-right: ${({ theme }) => theme.spacing(2)};
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
`;

const StyledTableCell = styled(TableCell)`
  overflow: hidden;
`;

type SettingsRoleAssignmentTableRowProps = {
  workspaceMember: WorkspaceMember;
};

export const SettingsRoleAssignmentTableRow = ({
  workspaceMember,
}: SettingsRoleAssignmentTableRowProps) => {
  return (
    <TableRow gridAutoColumns="2fr 4fr">
      <StyledTableCell>
        <StyledNameContainer>
          <StyledIconWrapper>
            <Avatar
              avatarUrl={workspaceMember.avatarUrl}
              placeholderColorSeed={workspaceMember.id}
              placeholder={workspaceMember.name.firstName ?? ''}
              type="rounded"
              size="md"
            />
          </StyledIconWrapper>
          <StyledNameCell>
            <OverflowingTextWithTooltip
              text={`${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`}
            />
          </StyledNameCell>
        </StyledNameContainer>
      </StyledTableCell>
      <StyledTableCell>
        <OverflowingTextWithTooltip text={workspaceMember.userEmail} />
      </StyledTableCell>
    </TableRow>
  );
};
