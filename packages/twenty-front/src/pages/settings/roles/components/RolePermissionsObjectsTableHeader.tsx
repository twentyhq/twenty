import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { Checkbox } from 'twenty-ui';

const StyledTableHeaderRow = styled(Table)`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

type RolePermissionsObjectsTableHeaderProps = {
  className?: string;
};

export const RolePermissionsObjectsTableHeader = ({
  className,
}: RolePermissionsObjectsTableHeaderProps) => (
  <StyledTableHeaderRow className={className}>
    <TableRow gridAutoColumns="150px 1fr">
      <TableHeader>{t`Name`}</TableHeader>
      <TableHeader align={'right'} aria-label={t`Actions`}>
        <Checkbox checked={true} disabled />
      </TableHeader>
    </TableRow>
  </StyledTableHeaderRow>
);
