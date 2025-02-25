import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { Avatar, OverflowingTextWithTooltip } from 'twenty-ui';
import { WorkspaceMember } from '~/generated-metadata/graphql';

const StyledTable = styled(Table)`
  margin-top: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledIconWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-right: ${({ theme }) => theme.spacing(2)};
`;

type RoleAssignmentTableRowProps = {
  workspaceMember: WorkspaceMember;
};

export const RoleAssignmentTableRow = ({
  workspaceMember,
}: RoleAssignmentTableRowProps) => {
  return (
    <StyledTable>
      <TableRow gridAutoColumns="150px 1fr 1fr">
        <TableCell>
          <StyledIconWrapper>
            <Avatar
              avatarUrl={workspaceMember.avatarUrl}
              placeholderColorSeed={workspaceMember.id}
              placeholder={workspaceMember.name.firstName ?? ''}
              type="rounded"
              size="md"
            />
          </StyledIconWrapper>
          <OverflowingTextWithTooltip
            text={`${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`}
          />
        </TableCell>
        <TableCell>
          <OverflowingTextWithTooltip text={workspaceMember.userEmail} />
        </TableCell>
      </TableRow>
    </StyledTable>
  );
};
