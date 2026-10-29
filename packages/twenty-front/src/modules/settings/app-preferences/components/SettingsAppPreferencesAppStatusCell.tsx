import { SettingsConnectedAccountSyncStatus } from '@/settings/app-preferences/components/SettingsConnectedAccountSyncStatus';
import { type AppPreferencesAppStatus } from '@/settings/app-preferences/types/AppPreferencesAppStatus';
import { useLingui } from '@lingui/react/macro';
import { Status, Tag } from 'twenty-ui/primitives/data-display';

type SettingsAppPreferencesAppStatusCellProps = {
  status?: AppPreferencesAppStatus;
};

export const SettingsAppPreferencesAppStatusCell = ({
  status,
}: SettingsAppPreferencesAppStatusCellProps) => {
  const { t } = useLingui();

  switch (status?.type) {
    case 'accountSyncIssue':
      return <SettingsConnectedAccountSyncStatus account={status.account} />;
    case 'reconnectNeeded':
      return <Status color="red">{t`Reconnect needed`}</Status>;
    case 'missingConfiguration':
      return <Status color="red">{t`Missing configuration`}</Status>;
    case 'notConnected':
      return (
        <Tag color="gray" weight="regular" truncate={false}>
          {t`Not connected`}
        </Tag>
      );
    default:
      return null;
  }
};
