import styled from '@emotion/styled';

import { TableRow } from '@/ui/layout/table/components/TableRow';

const StyledTableSubRow = styled(TableRow)`
  padding-left: ${({ theme }) => theme.spacing(4)};
`;

export const TableSubRow = StyledTableSubRow;
