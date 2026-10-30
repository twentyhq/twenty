import { SettingsConnectedAccountSyncStatus } from '@/settings/app-preferences/components/SettingsConnectedAccountSyncStatus';
import { type SettingsApplicationStatus } from '@/settings/applications/types/SettingsApplicationStatus';
import { getHighestPrioritySettingsApplicationStatus } from '@/settings/applications/utils/getHighestPrioritySettingsApplicationStatus';
import { useLingui } from '@lingui/react/macro';
import { Status, Tag } from 'twenty-ui/primitives/data-display';

type SettingsApplicationStatusCellProps = {
  statuses?: SettingsApplicationStatus[];
};

export const SettingsApplicationStatusCell = ({
  statuses = [],
}: SettingsApplicationStatusCellProps) => {
  const { t } = useLingui();
  const status = getHighestPrioritySettingsApplicationStatus(statuses);

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
    case 'updateAvailable':
      return (
        <Tag color="blue" weight="medium" truncate={false}>
          {t`Update`}
        </Tag>
      );
    default:
      return null;
  }
};
