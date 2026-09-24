import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableRow } from '@/ui/layout/table/components/TableRow';

const StyledCoreObjectTableBody = styled(TableBody)`
  gap: 0;
  padding: 0;
`;

const StyledCoreObjectTableRow = styled(TableRow)`
  border-radius: 0;

  &:not(:last-child) {
    border-bottom: 1px solid ${themeCssVariables.border.color.light};
  }
`;

export {
  StyledCoreObjectTableBody as CoreObjectTableBody,
  StyledCoreObjectTableRow as CoreObjectTableRow,
};
