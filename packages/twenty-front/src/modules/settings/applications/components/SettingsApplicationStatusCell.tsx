import { SettingsConnectedAccountSyncStatus } from '@/settings/app-preferences/components/SettingsConnectedAccountSyncStatus';
import { type SettingsApplicationStatus } from '@/settings/applications/types/SettingsApplicationStatus';
import { getHighestPrioritySettingsApplicationStatus } from '@/settings/applications/utils/getHighestPrioritySettingsApplicationStatus';
import { useLingui } from '@lingui/react/macro';
import { Status } from 'twenty-ui/primitives/data-display';

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
      return <Status color="red" weight="medium">{t`Sync failed`}</Status>;
    case 'missingConfiguration':
      return (
        <Status color="orange" weight="medium">{t`Setup incomplete`}</Status>
      );
    case 'notConnected':
      return <Status color="gray" weight="medium">{t`Inactive`}</Status>;
    case 'updateAvailable':
      return <Status color="blue" weight="medium">{t`Outdated`}</Status>;
    default:
      return null;
  }
};
