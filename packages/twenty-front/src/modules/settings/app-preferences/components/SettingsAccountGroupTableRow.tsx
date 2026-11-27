import { AppChip } from '@/applications/components/AppChip';
import { SettingsAccountGroupUsedBy } from '@/settings/app-preferences/components/SettingsAccountGroupUsedBy';
import { SettingsAppPreferencesRowDropdownMenu } from '@/settings/app-preferences/components/SettingsAppPreferencesRowDropdownMenu';
import { SettingsConnectedAccountIcon } from '@/settings/accounts/components/SettingsConnectedAccountIcon';
import { SettingsApplicationConnectionStatus } from '@/settings/applications/components/SettingsApplicationConnectionStatus';
import { SettingsConnectedAccountSyncStatus } from '@/settings/app-preferences/components/SettingsConnectedAccountSyncStatus';
import { SettingsBuiltInAccountAppPermissionsCell } from '@/settings/app-preferences/components/SettingsBuiltInAccountAppPermissionsCell';
import { type ConnectedAccountGroup } from '@/settings/app-preferences/types/ConnectedAccountGroup';
import { type BuiltInAccountApp } from '@/settings/app-preferences/types/BuiltInAccountApp';
import { getConnectedAccountSettingsChannels } from '@/settings/app-preferences/utils/getConnectedAccountSettingsChannels';
import { SettingsApplicationTableRow } from '@/settings/applications/components/SettingsApplicationTableRow';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { useTheme } from 'twenty-ui/theme';

type SettingsAccountGroupTableRowProps = {
  group: ConnectedAccountGroup;
  hasApplicationSettings: boolean;
  builtInAccountApp?: BuiltInAccountApp;
};

export const SettingsAccountGroupTableRow = ({
  group,
  hasApplicationSettings,
  builtInAccountApp,
}: SettingsAccountGroupTableRowProps) => {
  const theme = useTheme();
  const { builtInAccount } = group;

  const appAccount = group.appAccounts[0];
  const { messageChannel, calendarChannel } =
    getConnectedAccountSettingsChannels(builtInAccount);
  const hasSettings =
    isDefined(messageChannel) ||
    isDefined(calendarChannel) ||
    hasApplicationSettings;
  const ProviderIcon = isDefined(builtInAccount)
    ? SettingsConnectedAccountIcon({ account: builtInAccount })
    : undefined;

  return (
    <SettingsApplicationTableRow
      middleColumn="status"
      hasActionMenu
      link={
        hasSettings
          ? getSettingsPath(SettingsPath.AppPreferencesAccountDetail, {
              connectedAccountId: group.id,
            })
          : undefined
      }
      name={
        <>
          {isDefined(ProviderIcon) ? (
            <ProviderIcon
              size={theme.icon.size.md}
              stroke={theme.icon.stroke.sm}
            />
          ) : (
            <AppChip applicationId={appAccount?.applicationId} chipOnly />
          )}
          <OverflowingTextWithTooltip text={group.handle} />
        </>
      }
      middle={
        isDefined(builtInAccount) ? (
          <SettingsConnectedAccountSyncStatus account={builtInAccount} />
        ) : (
          isDefined(appAccount) && (
            <SettingsApplicationConnectionStatus connection={appAccount} />
          )
        )
      }
      details={
        isDefined(builtInAccountApp) ? (
          <SettingsBuiltInAccountAppPermissionsCell
            builtInAccountApp={builtInAccountApp}
            account={builtInAccount}
          />
        ) : (
          <SettingsAccountGroupUsedBy group={group} />
        )
      }
      detailsAlign={isDefined(builtInAccountApp) ? 'left' : 'right'}
      shouldShowDetailsOnMobile
      action={
        <SettingsAppPreferencesRowDropdownMenu
          group={group}
          hasAccountSettings={hasSettings}
          builtInAccountApp={builtInAccountApp}
        />
      }
    />
  );
};
