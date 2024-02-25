import { InboxSettingsVisibilityValue } from '@/settings/accounts/components/SettingsAccountsInboxVisibilitySettingsCard';

export type MessageChannel = {
  id: string;
  handle: string;
  isContactAutoCreationEnabled?: boolean;
  isSynced?: boolean;
  visibility: InboxSettingsVisibilityValue;
};
