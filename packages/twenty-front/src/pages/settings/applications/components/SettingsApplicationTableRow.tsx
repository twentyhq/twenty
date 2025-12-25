import styled from '@emotion/styled';
import { type ReactNode } from 'react';

import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';
import { type ApplicationWithoutRelation } from '~/pages/settings/applications/types/applicationWithoutRelation';

export type SettingsApplicationTableRowProps = {
  action: ReactNode;
  application: ApplicationWithoutRelation;
  link?: string;
};

export const StyledApplicationTableRow = styled(TableRow)`
  grid-template-columns: 164px minmax(0, 1fr) 36px;
`;

const StyledNameTableCell = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.secondary};
  gap: ${({ theme }) => theme.spacing(2)};
  min-width: 0;
  overflow: hidden;
`;

const StyledActionTableCell = styled(TableCell)`
  justify-content: flex-end;
  padding-right: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsApplicationTableRow = ({
  action,
  application,
  link,
}: SettingsApplicationTableRowProps) => {
  return (
    <StyledApplicationTableRow key={application.id} to={link}>
      <StyledNameTableCell>
        <OverflowingTextWithTooltip text={application.name} />
      </StyledNameTableCell>
      <TableCell>
        <OverflowingTextWithTooltip text={application.description} />
      </TableCell>
      <StyledActionTableCell>{action}</StyledActionTableCell>
    </StyledApplicationTableRow>
  );
};
