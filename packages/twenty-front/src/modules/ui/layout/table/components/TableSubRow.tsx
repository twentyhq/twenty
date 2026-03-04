import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { TableRow } from '@/ui/layout/table/components/TableRow';

const StyledTableSubRow = styled(TableRow)`
  padding-left: ${themeCssVariables.spacing[4]};
`;

export const TableSubRow = StyledTableSubRow;
