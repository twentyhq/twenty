import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { TableRow } from '@/ui/layout/table/components/TableRow';

const StyledTableSubRowContainer = styled.div`
  padding-left: ${themeCssVariables.spacing[4]};
`;

export const TableSubRow = ({
  children,
  ...props
}: React.ComponentProps<typeof TableRow> & { children?: ReactNode }) => (
  <StyledTableSubRowContainer>
    {/* oxlint-disable-next-line react/jsx-props-no-spreading */}
    <TableRow {...props}>{children}</TableRow>
  </StyledTableSubRowContainer>
);
