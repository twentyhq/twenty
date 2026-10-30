import { type SettingsApplicationStatus } from '@/settings/applications/types/SettingsApplicationStatus';

export type SettingsWorkspaceApplicationStatus = Extract<
  SettingsApplicationStatus,
  { type: 'missingConfiguration' | 'updateAvailable' }
>;
