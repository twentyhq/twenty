import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import {
  Avatar,
  IconButton,
  IconTrash,
  OverflowingTextWithTooltip,
} from 'twenty-ui';
import { WorkspaceMember } from '~/generated-metadata/graphql';

const StyledTable = styled(Table)`
  margin-top: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledIconWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-right: ${({ theme }) => theme.spacing(2)};
`;

const StyledButtonContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  margin-left: ${({ theme }) => theme.spacing(3)};
`;

type RoleAssignmentTableRowProps = {
  workspaceMember: WorkspaceMember;
  onRemove: (workspaceMemberId: string) => void;
};

export const RoleAssignmentTableRow = ({
  workspaceMember,
  onRemove,
}: RoleAssignmentTableRowProps) => {
  const handleRemoveClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onRemove(workspaceMember.id);
  };

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
        <TableCell align={'right'}>
          <StyledButtonContainer>
            <IconButton
              onClick={handleRemoveClick}
              variant="tertiary"
              size="medium"
              Icon={IconTrash}
              aria-label={t`Remove`}
            />
          </StyledButtonContainer>
        </TableCell>
      </TableRow>
    </StyledTable>
  );
};
