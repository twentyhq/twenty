import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { AppChip } from '@/applications/components/AppChip';
import { SettingsAccountsRowDropdownMenu } from '@/settings/accounts/components/SettingsAccountsRowDropdownMenu';
import { SettingsConnectedAccountIcon } from '@/settings/accounts/components/SettingsConnectedAccountIcon';
import { SettingsAppPreferencesAccountStatus } from '@/settings/app-preferences/components/SettingsAppPreferencesAccountStatus';
import { SettingsAppPreferencesAccountUsedByCell } from '@/settings/app-preferences/components/SettingsAppPreferencesAccountUsedByCell';
import { SettingsAppPreferencesApplicationAccountDropdownMenu } from '@/settings/app-preferences/components/SettingsAppPreferencesApplicationAccountDropdownMenu';
import { type AppPreferencesApplication } from '@/settings/app-preferences/types/AppPreferencesApplication';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useMemo } from 'react';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

export const SETTINGS_APP_PREFERENCES_ACCOUNTS_GRID_TEMPLATE_COLUMNS =
  'minmax(0, 1fr) auto 36px';

type SettingsAppPreferencesAccountRowProps = {
  account: ConnectedAccount;
  application?: AppPreferencesApplication;
};

export const SettingsAppPreferencesAccountRow = ({
  account,
  application,
}: SettingsAppPreferencesAccountRowProps) => {
  const theme = useTheme();

  const isApplicationAccount =
    account.provider === ConnectedAccountProvider.APP;

  // The IMAP icon is built per account, so it is kept across renders to spare
  // React a remount of the row's icon on every update.
  const ProviderIcon = useMemo(
    () => SettingsConnectedAccountIcon({ account }),
    [account],
  );

  return (
    <TableRow
      gridTemplateColumns={
        SETTINGS_APP_PREFERENCES_ACCOUNTS_GRID_TEMPLATE_COLUMNS
      }
    >
      <TableCell
        color={themeCssVariables.font.color.primary}
        gap={themeCssVariables.spacing[2]}
        minWidth="0"
        overflow="hidden"
      >
        {isApplicationAccount ? (
          <AppChip
            applicationId={account.applicationId}
            logoUrl={application?.logoUrl}
            fallbackApplicationData={{ name: application?.name }}
            size="md"
            chipOnly
          />
        ) : (
          <ProviderIcon
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
          />
        )}
        <OverflowingTextWithTooltip text={account.handle} />
      </TableCell>
      <TableCell align="right" gap={themeCssVariables.spacing[2]}>
        <SettingsAppPreferencesAccountStatus account={account} />
        <SettingsAppPreferencesAccountUsedByCell
          account={account}
          application={application}
        />
      </TableCell>
      <TableCell align="right" padding="0">
        {isApplicationAccount ? (
          <SettingsAppPreferencesApplicationAccountDropdownMenu
            account={account}
          />
        ) : (
          <SettingsAccountsRowDropdownMenu account={account} />
        )}
      </TableCell>
    </TableRow>
  );
};
