import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsAccountsConnectedAccountsRowRightContainer } from '@/settings/accounts/components/SettingsAccountsConnectedAccountsRowRightContainer';
import { SettingsConnectedAccountIcon } from '@/settings/accounts/components/SettingsConnectedAccountIcon';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import {
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from 'twenty-ui/theme-constants';

const StyledNameCell = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

type SettingsConnectedAccountsTableRowProps = {
  account: ConnectedAccount;
};

export const SettingsConnectedAccountsTableRow = ({
  account,
}: SettingsConnectedAccountsTableRowProps) => {
  const IconComponent = SettingsConnectedAccountIcon({ account });

  return (
    <TableRow
      key={account.id}
      gridAutoColumns="332px 1fr"
      hoverBackgroundColor={themeCssVariables.background.transparent.light}
      cursor="pointer"
    >
      <TableCell>
        <StyledNameCell>
          <IconComponent
            size={resolveThemeVariableAsNumber(themeCssVariables.icon.size.md)}
            stroke={resolveThemeVariableAsNumber(
              themeCssVariables.icon.stroke.sm,
            )}
          />
          {account.handle}
        </StyledNameCell>
      </TableCell>
      <TableCell align="right">
        <SettingsAccountsConnectedAccountsRowRightContainer account={account} />
      </TableCell>
    </TableRow>
  );
};
