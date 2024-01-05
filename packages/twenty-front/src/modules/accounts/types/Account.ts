import { InboxSettingsVisibilityValue } from '@/settings/accounts/components/SettingsAccountsInboxSettingsVisibilitySection';

export type Account = {
  id: string;
  handle: string;
  isSynced?: boolean;
  visibility: InboxSettingsVisibilityValue;
};
