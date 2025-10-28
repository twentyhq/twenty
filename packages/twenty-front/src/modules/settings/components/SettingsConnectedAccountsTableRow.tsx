import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsAccountsConnectedAccountsRowRightContainer } from '@/settings/accounts/components/SettingsAccountsConnectedAccountsRowRightContainer';
import { SettingsConnectedAccountIcon } from '@/settings/accounts/components/SettingsConnectedAccountIcon';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

const StyledNameCell = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledTableRow = styled(TableRow)`
  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
    cursor: pointer;
  }
`;

type SettingsConnectedAccountsTableRowProps = {
  account: ConnectedAccount;
};

export const SettingsConnectedAccountsTableRow = ({
  account,
}: SettingsConnectedAccountsTableRowProps) => {
  const theme = useTheme();

  const IconComponent = SettingsConnectedAccountIcon({ account });

  return (
    <StyledTableRow key={account.id} gridAutoColumns="332px 1fr">
      <TableCell>
        <StyledNameCell>
          <IconComponent
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
          />
          {account.handle}
        </StyledNameCell>
      </TableCell>
      <TableCell align="right">
        <SettingsAccountsConnectedAccountsRowRightContainer account={account} />
      </TableCell>
    </StyledTableRow>
  );
};
