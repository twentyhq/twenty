import { SettingsAccountGroupUsedBy } from '@/settings/app-preferences/components/SettingsAccountGroupUsedBy';
import { SettingsAppPreferencesRowDropdownMenu } from '@/settings/app-preferences/components/SettingsAppPreferencesRowDropdownMenu';
import { SettingsConnectedAccountIcon } from '@/settings/accounts/components/SettingsConnectedAccountIcon';
import { SettingsConnectedAccountSyncStatus } from '@/settings/app-preferences/components/SettingsConnectedAccountSyncStatus';
import { SettingsBuiltInAccountAppPermissionsCell } from '@/settings/app-preferences/components/SettingsBuiltInAccountAppPermissionsCell';
import { SETTINGS_ACCOUNT_GROUP_TABLE_GRID_TEMPLATE_COLUMNS } from '@/settings/app-preferences/constants/SettingsAccountGroupTableGridTemplateColumns';
import { SyncStatus } from '@/settings/accounts/constants/SyncStatus';
import { type ConnectedAccountGroup } from '@/settings/app-preferences/types/ConnectedAccountGroup';
import { type BuiltInAccountApp } from '@/settings/app-preferences/types/BuiltInAccountApp';
import { computeSyncStatus } from '@/settings/accounts/utils/computeSyncStatus';
import { getConnectedAccountSettingsChannels } from '@/settings/app-preferences/utils/getConnectedAccountSettingsChannels';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { UndecoratedLink } from '@/ui/navigation/link/components/UndecoratedLink/UndecoratedLink';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

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
  const navigateSettings = useNavigateSettings();
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

  const accountCell = (
    <TableCell
      color={themeCssVariables.font.color.primary}
      gap={themeCssVariables.spacing[2]}
      minWidth="0"
    >
      <ProviderIcon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
      <OverflowingTextWithTooltip text={group.handle} />
      {shouldShowSyncStatus && (
        <SettingsConnectedAccountSyncStatus account={builtInAccount} />
      )}
    </TableCell>
  );

  return (
    <TableRow
      gridTemplateColumns={SETTINGS_ACCOUNT_GROUP_TABLE_GRID_TEMPLATE_COLUMNS}
      onClick={
        hasSettings
          ? () =>
              navigateSettings(SettingsPath.AppPreferencesAccountDetail, {
                connectedAccountId: group.id,
              })
          : undefined
      }
    >
      {hasSettings ? (
        <UndecoratedLink
          to={getSettingsPath(SettingsPath.AppPreferencesAccountDetail, {
            connectedAccountId: group.id,
          })}
          onClick={(event) => event.stopPropagation()}
        >
          {accountCell}
        </UndecoratedLink>
      ) : (
        accountCell
      )}
      {isDefined(builtInAccountApp) ? (
        <SettingsBuiltInAccountAppPermissionsCell
          builtInAccountApp={builtInAccountApp}
          account={builtInAccount}
        />
      ) : (
        <TableCell align="right">
          <SettingsAccountGroupUsedBy group={group} />
        </TableCell>
      )}
      <TableCell align="right" onClick={(event) => event.stopPropagation()}>
        <SettingsAppPreferencesRowDropdownMenu
          group={group}
          hasAccountSettings={hasSettings}
          builtInAccountApp={builtInAccountApp}
        />
      </TableCell>
    </TableRow>
  );
};
