import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsAccountsConnectedAccountsRowRightContainer } from '@/settings/accounts/components/SettingsAccountsConnectedAccountsRowRightContainer';
import { SettingsConnectedAccountIcon } from '@/settings/accounts/components/SettingsConnectedAccountIcon';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledNameCell = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledTableRow = styled(TableRow)`
  &:hover {
    background: ${themeCssVariables.background.transparent.light};
    cursor: pointer;
  }
`;

type SettingsConnectedAccountsTableRowProps = {
  account: ConnectedAccount;
};

export const SettingsConnectedAccountsTableRow = ({
  account,
}: SettingsConnectedAccountsTableRowProps) => {
  const { theme } = useContext(ThemeContext);
  const IconComponent = SettingsConnectedAccountIcon({ account });

  return (
    <StyledTableRow key={account.id} gridAutoColumns="332px 1fr">
      <TableCell>
        <StyledNameCell>
          <IconComponent
            size={parseFloat(theme.icon.size.md)}
            stroke={parseFloat(theme.icon.stroke.sm)}
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
