import { SettingsAccountGroupUsedBy } from '@/settings/app-preferences/components/SettingsAccountGroupUsedBy';
import { SettingsAppPreferencesRowDropdownMenu } from '@/settings/app-preferences/components/SettingsAppPreferencesRowDropdownMenu';
import { SettingsConnectedAccountIcon } from '@/settings/accounts/components/SettingsConnectedAccountIcon';
import { SettingsConnectedAccountSyncStatus } from '@/settings/app-preferences/components/SettingsConnectedAccountSyncStatus';
import { SettingsNativeAccountAppPermissionsCell } from '@/settings/app-preferences/components/SettingsNativeAccountAppPermissionsCell';
import { SyncStatus } from '@/settings/accounts/constants/SyncStatus';
import { type ConnectedAccountGroup } from '@/settings/app-preferences/types/ConnectedAccountGroup';
import { type NativeAccountApp } from '@/settings/app-preferences/types/NativeAccountApp';
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

const SYNC_STATUSES_NEEDING_ACTION: ReadonlySet<SyncStatus> = new Set([
  SyncStatus.FAILED,
  SyncStatus.PENDING_CONFIGURATION,
]);

type SettingsAccountGroupTableRowProps = {
  group: ConnectedAccountGroup;
  gridTemplateColumns: string;
  nativeAccountApp?: NativeAccountApp;
};

export const SettingsAccountGroupTableRow = ({
  group,
  gridTemplateColumns,
  nativeAccountApp,
}: SettingsAccountGroupTableRowProps) => {
  const theme = useTheme();
  const navigateSettings = useNavigateSettings();
  const { nativeAccount } = group;

  const ProviderIcon = SettingsConnectedAccountIcon({
    account: nativeAccount ?? group.appAccounts[0],
  });
  const { messageChannel, calendarChannel } =
    getConnectedAccountSettingsChannels(nativeAccount);
  const hasSettings = isDefined(messageChannel) || isDefined(calendarChannel);
  const needsAction =
    isDefined(nativeAccount) &&
    (isDefined(nativeAccount.archivedAt) ||
      SYNC_STATUSES_NEEDING_ACTION.has(
        computeSyncStatus(
          nativeAccount.messageChannels[0],
          nativeAccount.calendarChannels[0],
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
      {needsAction && (
        <SettingsConnectedAccountSyncStatus account={nativeAccount} />
      )}
    </TableCell>
  );

  return (
    <TableRow
      gridTemplateColumns={gridTemplateColumns}
      onClick={
        hasSettings
          ? () =>
              navigateSettings(SettingsPath.AccountDetail, {
                connectedAccountId: group.id,
              })
          : undefined
      }
    >
      {hasSettings ? (
        <UndecoratedLink
          to={getSettingsPath(SettingsPath.AccountDetail, {
            connectedAccountId: group.id,
          })}
          onClick={(event) => event.stopPropagation()}
        >
          {accountCell}
        </UndecoratedLink>
      ) : (
        accountCell
      )}
      {isDefined(nativeAccountApp) ? (
        <SettingsNativeAccountAppPermissionsCell
          nativeAccountApp={nativeAccountApp}
          account={nativeAccount}
        />
      ) : (
        <TableCell align="right">
          <SettingsAccountGroupUsedBy group={group} />
        </TableCell>
      )}
      <TableCell align="right" onClick={(event) => event.stopPropagation()}>
        {isDefined(nativeAccount) && (
          <SettingsAppPreferencesRowDropdownMenu account={nativeAccount} />
        )}
      </TableCell>
    </TableRow>
  );
};
