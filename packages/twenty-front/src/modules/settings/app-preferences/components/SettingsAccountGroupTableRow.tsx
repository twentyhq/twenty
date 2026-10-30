import { SettingsAccountGroupUsedBy } from '@/settings/app-preferences/components/SettingsAccountGroupUsedBy';
import { SettingsAppPreferencesRowDropdownMenu } from '@/settings/app-preferences/components/SettingsAppPreferencesRowDropdownMenu';
import { SettingsConnectedAccountIcon } from '@/settings/accounts/components/SettingsConnectedAccountIcon';
import { SettingsConnectedAccountSyncStatus } from '@/settings/app-preferences/components/SettingsConnectedAccountSyncStatus';
import { SettingsBuiltInAccountAppPermissionsCell } from '@/settings/app-preferences/components/SettingsBuiltInAccountAppPermissionsCell';
import { SyncStatus } from '@/settings/accounts/constants/SyncStatus';
import { type ConnectedAccountGroup } from '@/settings/app-preferences/types/ConnectedAccountGroup';
import { type BuiltInAccountApp } from '@/settings/app-preferences/types/BuiltInAccountApp';
import { computeSyncStatus } from '@/settings/accounts/utils/computeSyncStatus';
import { getConnectedAccountSettingsChannels } from '@/settings/app-preferences/utils/getConnectedAccountSettingsChannels';
import { SettingsApplicationTableRow } from '@/settings/applications/components/SettingsApplicationTableRow';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { useTheme } from 'twenty-ui/theme';

const DISPLAYED_SYNC_STATUSES: ReadonlySet<SyncStatus> = new Set([
  SyncStatus.FAILED,
  SyncStatus.PENDING_CONFIGURATION,
  SyncStatus.IMPORTING,
]);

type SettingsAccountGroupTableRowProps = {
  group: ConnectedAccountGroup;
  builtInAccountApp?: BuiltInAccountApp;
};

export const SettingsAccountGroupTableRow = ({
  group,
  builtInAccountApp,
}: SettingsAccountGroupTableRowProps) => {
  const theme = useTheme();
  const { builtInAccount } = group;

  const ProviderIcon = SettingsConnectedAccountIcon({
    account: builtInAccount ?? group.appAccounts[0],
  });
  const { messageChannel, calendarChannel } =
    getConnectedAccountSettingsChannels(builtInAccount);
  const hasSettings = isDefined(messageChannel) || isDefined(calendarChannel);
  const shouldShowSyncStatus =
    isDefined(builtInAccount) &&
    (isDefined(builtInAccount.archivedAt) ||
      DISPLAYED_SYNC_STATUSES.has(
        computeSyncStatus(
          builtInAccount.messageChannels[0],
          builtInAccount.calendarChannels[0],
        ),
      ));

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
          <ProviderIcon
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
          />
          <OverflowingTextWithTooltip text={group.handle} />
        </>
      }
      middle={
        shouldShowSyncStatus && (
          <SettingsConnectedAccountSyncStatus account={builtInAccount} />
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
