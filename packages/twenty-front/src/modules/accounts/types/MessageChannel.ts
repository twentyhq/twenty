import { InboxSettingsVisibilityValue } from '@/settings/accounts/components/SettingsAccountsInboxVisibilitySettingsCard';

export type MessageChannel = {
  id: string;
  handle: string;
  isContactAutoCreationEnabled?: boolean;
  isSyncEnabled: boolean;
  visibility: InboxSettingsVisibilityValue;
  syncStatus: string;
  __typename: 'MessageChannel';
};
