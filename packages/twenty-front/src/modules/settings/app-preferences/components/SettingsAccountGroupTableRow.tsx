import { AppChip } from '@/applications/components/AppChip';
import { SettingsConnectedAccountIcon } from '@/settings/accounts/components/SettingsConnectedAccountIcon';
import { SyncStatus } from '@/settings/accounts/constants/SyncStatus';
import { computeSyncStatus } from '@/settings/accounts/utils/computeSyncStatus';
import { SettingsAccountGroupUsedBy } from '@/settings/app-preferences/components/SettingsAccountGroupUsedBy';
import { SettingsAppPreferencesAppAccountsRowDropdownMenu } from '@/settings/app-preferences/components/SettingsAppPreferencesAppAccountsRowDropdownMenu';
import { SettingsAppPreferencesRowDropdownMenu } from '@/settings/app-preferences/components/SettingsAppPreferencesRowDropdownMenu';
import { SettingsBuiltInAccountAppPermissionsCell } from '@/settings/app-preferences/components/SettingsBuiltInAccountAppPermissionsCell';
import { SettingsConnectedAccountSyncStatus } from '@/settings/app-preferences/components/SettingsConnectedAccountSyncStatus';
import { useApplicationsWithPreferences } from '@/settings/app-preferences/hooks/useApplicationsWithPreferences';
import { type BuiltInAccountApp } from '@/settings/app-preferences/types/BuiltInAccountApp';
import { type ConnectedAccountGroup } from '@/settings/app-preferences/types/ConnectedAccountGroup';
import { getApplicationPreferencesConnectionsPath } from '@/settings/app-preferences/utils/getApplicationPreferencesConnectionsPath';
import { getConnectedAccountSettingsChannels } from '@/settings/app-preferences/utils/getConnectedAccountSettingsChannels';
import { isApplicationConnectionReconnectNeeded } from '@/settings/applications/utils/isApplicationConnectionReconnectNeeded';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { UndecoratedLink } from '@/ui/navigation/link/components/UndecoratedLink/UndecoratedLink';
import { useLingui } from '@lingui/react/macro';
import { useNavigate } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import {
  getSettingsPath,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';
import { Status } from 'twenty-ui/primitives/data-display';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const SYNC_STATUSES_NEEDING_ACTION: ReadonlySet<SyncStatus> = new Set([
  SyncStatus.FAILED,
  SyncStatus.PENDING_CONFIGURATION,
]);

const getAccountGroupSettingsPath = ({
  groupId,
  hasBuiltInAccount,
  hasSettingsChannel,
  appOnlyConnectionsApplicationId,
}: {
  groupId: string;
  hasBuiltInAccount: boolean;
  hasSettingsChannel: boolean;
  appOnlyConnectionsApplicationId: string | undefined;
}): string | undefined => {
  if (hasBuiltInAccount) {
    return hasSettingsChannel
      ? getSettingsPath(SettingsPath.AccountDetail, {
          connectedAccountId: groupId,
        })
      : undefined;
  }

  if (isDefined(appOnlyConnectionsApplicationId)) {
    return getApplicationPreferencesConnectionsPath(
      appOnlyConnectionsApplicationId,
    );
  }

  return undefined;
};

type SettingsAccountGroupTableRowProps = {
  group: ConnectedAccountGroup;
  gridTemplateColumns: string;
  builtInAccountApp?: BuiltInAccountApp;
};

export const SettingsAccountGroupTableRow = ({
  group,
  gridTemplateColumns,
  builtInAccountApp,
}: SettingsAccountGroupTableRowProps) => {
  const theme = useTheme();
  const { t } = useLingui();
  const navigate = useNavigate();
  const { applicationsWithPreferences } = useApplicationsWithPreferences();
  const { builtInAccount } = group;

  const ProviderIcon = SettingsConnectedAccountIcon({
    account: builtInAccount ?? group.appAccounts[0],
  });
  const { messageChannel, calendarChannel } =
    getConnectedAccountSettingsChannels(builtInAccount);
  const applicationIdsWithConnectionsTab = new Set(
    applicationsWithPreferences
      .filter(({ connectionProviders }) => isNonEmptyArray(connectionProviders))
      .map(({ application }) => application.id),
  );
  const appOnlyConnectionsApplicationId = isDefined(builtInAccount)
    ? undefined
    : group.appAccounts
        .map(({ applicationId }) => applicationId)
        .find(
          (applicationId): applicationId is string =>
            isDefined(applicationId) &&
            applicationIdsWithConnectionsTab.has(applicationId),
        );
  const appOnlyApplicationId = isDefined(builtInAccount)
    ? undefined
    : (appOnlyConnectionsApplicationId ??
      group.appAccounts[0]?.applicationId ??
      undefined);
  const settingsPath = getAccountGroupSettingsPath({
    groupId: group.id,
    hasBuiltInAccount: isDefined(builtInAccount),
    hasSettingsChannel: isDefined(messageChannel) || isDefined(calendarChannel),
    appOnlyConnectionsApplicationId,
  });
  const isAppOnlyReconnectNeeded =
    !isDefined(builtInAccount) &&
    group.appAccounts.some(isApplicationConnectionReconnectNeeded);
  const needsAction =
    isDefined(builtInAccount) &&
    (isDefined(builtInAccount.archivedAt) ||
      SYNC_STATUSES_NEEDING_ACTION.has(
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
      {isDefined(appOnlyApplicationId) ? (
        <AppChip applicationId={appOnlyApplicationId} chipOnly />
      ) : (
        <ProviderIcon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
      )}
      <OverflowingTextWithTooltip text={group.handle} />
      {needsAction && (
        <SettingsConnectedAccountSyncStatus account={builtInAccount} />
      )}
      {isAppOnlyReconnectNeeded && (
        <Status color="red" weight="medium">{t`Reconnect needed`}</Status>
      )}
    </TableCell>
  );

  return (
    <TableRow
      gridTemplateColumns={gridTemplateColumns}
      onClick={
        isDefined(settingsPath) ? () => navigate(settingsPath) : undefined
      }
    >
      {isDefined(settingsPath) ? (
        <UndecoratedLink
          to={settingsPath}
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
        {isDefined(builtInAccount) ? (
          <SettingsAppPreferencesRowDropdownMenu account={builtInAccount} />
        ) : (
          <SettingsAppPreferencesAppAccountsRowDropdownMenu
            groupId={group.id}
            appAccounts={group.appAccounts}
          />
        )}
      </TableCell>
    </TableRow>
  );
};
