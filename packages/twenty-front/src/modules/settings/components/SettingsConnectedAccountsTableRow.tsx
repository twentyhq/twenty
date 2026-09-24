import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsAccountsConnectedAccountsRowRightContainer } from '@/settings/accounts/components/SettingsAccountsConnectedAccountsRowRightContainer';
import { SettingsConnectedAccountIcon } from '@/settings/accounts/components/SettingsConnectedAccountIcon';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

const StyledNameCell = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledTableRowContainer = styled.div`
  > * {
    &:hover {
      background-color: ${themeCssVariables.background.transparent.light};
      cursor: pointer;
    }
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
    <StyledTableRowContainer>
      <TableRow key={account.id} gridTemplateColumns="minmax(0, 1fr) auto">
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
          <SettingsAccountsConnectedAccountsRowRightContainer
            account={account}
          />
        </TableCell>
      </TableRow>
    </StyledTableRowContainer>
  );
};
