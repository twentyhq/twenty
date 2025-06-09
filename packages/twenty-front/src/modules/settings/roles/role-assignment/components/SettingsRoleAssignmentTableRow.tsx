import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersStates';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { Avatar, OverflowingTextWithTooltip } from 'twenty-ui/display';
import { WorkspaceMember } from '~/generated-metadata/graphql';

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
  const currentWorkspaceMembers = useRecoilValue(currentWorkspaceMembersState);
  const enrichedWorkspaceMember = currentWorkspaceMembers.find(
    (member) => member.id === workspaceMember.id,
  );

  return (
    <TableRow gridAutoColumns="2fr 4fr">
      <StyledTableCell>
        <StyledNameContainer>
          <StyledIconWrapper>
            <Avatar
              avatarUrl={enrichedWorkspaceMember?.avatarUrl}
              placeholderColorSeed={enrichedWorkspaceMember?.id}
              placeholder={enrichedWorkspaceMember?.name.firstName ?? ''}
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
