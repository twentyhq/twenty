import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { type ReactNode } from 'react';

import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';
import { type Application } from '~/generated/graphql';

export type SettingsApplicationTableRowProps = {
  action: ReactNode;
  application: Application;
  link?: string;
};

export const StyledApplicationTableRow = styled(TableRow)`
  grid-template-columns: 1fr 120px 36px;
`;

const StyledNameTableCell = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.primary};
  gap: ${({ theme }) => theme.spacing(2)};
  min-width: 0;
  overflow: hidden;
`;

const StyledActionTableCell = styled(TableCell)`
  justify-content: flex-end;
  padding-right: ${({ theme }) => theme.spacing(2)};
`;

const StyledIconContainer = styled.div`
  flex-shrink: 0;
`;

export const SettingsApplicationTableRow = ({
  action,
  application,
  link,
}: SettingsApplicationTableRowProps) => {
  const theme = useTheme();

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
