import { InboxSettingsVisibilityValue } from '@/settings/accounts/components/SettingsAccountsInboxSettingsVisibilitySection';

export type Account = {
  email: string;
  isSynced?: boolean;
  uuid: string;
  visibility: InboxSettingsVisibilityValue;
};
