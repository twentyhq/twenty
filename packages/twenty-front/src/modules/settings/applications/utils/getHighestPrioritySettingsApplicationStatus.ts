import { SETTINGS_APPLICATION_STATUS_URGENCY_RANK } from '@/settings/applications/constants/SettingsApplicationStatusUrgencyRank';
import { type SettingsApplicationStatus } from '@/settings/applications/types/SettingsApplicationStatus';

export const getHighestPrioritySettingsApplicationStatus = <
  TSettingsApplicationStatus extends Pick<SettingsApplicationStatus, 'type'>,
>(
  statuses: TSettingsApplicationStatus[],
): TSettingsApplicationStatus | undefined =>
  [...statuses].sort(
    (firstStatus, secondStatus) =>
      SETTINGS_APPLICATION_STATUS_URGENCY_RANK[firstStatus.type] -
      SETTINGS_APPLICATION_STATUS_URGENCY_RANK[secondStatus.type],
  )[0];
