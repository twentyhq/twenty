import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsAccountsConnectedAccountsRowRightContainer } from '@/settings/accounts/components/SettingsAccountsConnectedAccountsRowRightContainer';
import { SettingsAppPreferencesApplicationAccountRowRightContainer } from '@/settings/app-preferences/components/SettingsAppPreferencesApplicationAccountRowRightContainer';
import { SettingsAppPreferencesConnectedAccountApplicationCell } from '@/settings/app-preferences/components/SettingsAppPreferencesConnectedAccountApplicationCell';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { themeCssVariables } from 'twenty-ui/theme';

export const SETTINGS_APP_PREFERENCES_CONNECTED_ACCOUNTS_GRID_TEMPLATE_COLUMNS =
  'minmax(0, 1fr) 180px auto';

type SettingsAppPreferencesConnectedAccountRowProps = {
  account: ConnectedAccount;
};

export const SettingsAppPreferencesConnectedAccountRow = ({
  account,
}: SettingsAppPreferencesConnectedAccountRowProps) => {
  const isApplicationAccount =
    account.provider === ConnectedAccountProvider.APP;

  return (
    <TableRow
      gridTemplateColumns={
        SETTINGS_APP_PREFERENCES_CONNECTED_ACCOUNTS_GRID_TEMPLATE_COLUMNS
      }
    >
      <TableCell
        color={themeCssVariables.font.color.primary}
        minWidth="0"
        overflow="hidden"
        textOverflow="ellipsis"
        whiteSpace="nowrap"
      >
        {account.handle}
      </TableCell>
      <TableCell minWidth="0" overflow="hidden">
        <SettingsAppPreferencesConnectedAccountApplicationCell
          account={account}
        />
      </TableCell>
      <TableCell align="right">
        {isApplicationAccount ? (
          <SettingsAppPreferencesApplicationAccountRowRightContainer
            account={account}
          />
        ) : (
          <SettingsAccountsConnectedAccountsRowRightContainer
            account={account}
          />
        )}
      </TableCell>
    </TableRow>
  );
};
