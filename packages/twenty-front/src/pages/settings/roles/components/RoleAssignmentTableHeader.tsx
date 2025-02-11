import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';

const StyledTableHeaderRow = styled(Table)`
  margin-bottom: ${({ theme }) => theme.spacing(1.5)};
`;

type RoleAssignmentTableHeaderProps = {
  className?: string;
};

export const RoleAssignmentTableHeader = ({
  className,
}: RoleAssignmentTableHeaderProps) => (
  <StyledTableHeaderRow className={className}>
    <TableRow gridAutoColumns="150px 1fr 1fr">
      <TableHeader>{t`Name`}</TableHeader>
      <TableHeader>{t`Email`}</TableHeader>
      <TableHeader align={'right'} aria-label={t`Actions`}></TableHeader>
    </TableRow>
  </StyledTableHeaderRow>
);
