import { type SettingsApplicationStatus } from '@/settings/applications/types/SettingsApplicationStatus';

export const SETTINGS_APPLICATION_STATUS_URGENCY_RANK: Record<
  SettingsApplicationStatus['type'],
  number
> = {
  reconnectNeeded: 0,
  accountSyncIssue: 1,
  missingConfiguration: 2,
  notConnected: 3,
  updateAvailable: 4,
};
