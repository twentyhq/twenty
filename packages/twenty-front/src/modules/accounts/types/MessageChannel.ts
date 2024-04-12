import { InboxSettingsVisibilityValue } from '@/settings/accounts/components/SettingsAccountsInboxVisibilitySettingsCard';

export enum MessageChannelSyncStatus {
  PENDING = 'PENDING',
  ONGOING = 'ONGOING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
}

export type MessageChannel = {
  id: string;
  handle: string;
  isContactAutoCreationEnabled?: boolean;
  isSynced?: boolean;
  visibility: InboxSettingsVisibilityValue;
  syncStatus: MessageChannelSyncStatus;
};
