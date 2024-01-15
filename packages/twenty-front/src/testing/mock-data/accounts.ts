import { BlockedEmail } from '@/accounts/types/BlockedEmail';
import { MessageChannel } from '@/accounts/types/MessageChannel';
import { InboxSettingsVisibilityValue } from '@/settings/accounts/components/SettingsAccountsInboxSettingsVisibilitySection';

export const mockedAccounts: MessageChannel[] = [
  {
    handle: 'thomas@twenty.com',
    isSynced: true,
    isContactAutoCreationEnabled: true,
    id: '0794b782-f52e-48c3-977e-b0f57f90de24',
    visibility: InboxSettingsVisibilityValue.Everything,
  },
  {
    handle: 'thomas@twenty.dev',
    isSynced: false,
    isContactAutoCreationEnabled: true,
    id: 'dc66a7ec-56b2-425b-a8e8-26ff0396c3aa',
    visibility: InboxSettingsVisibilityValue.Metadata,
  },
];

export const mockedBlockedEmailList: BlockedEmail[] = [
  {
    email: 'thomas@twenty.com',
    id: '9594b782-232e-48c3-977e-b0f57f90de24',
    blocked_at: '12/06/2023',
  },
  {
    email: 'tim@apple.com',
    id: 'ac64a7ec-76b2-325b-a8e8-28ff0396c3aa',
    blocked_at: '11/06/2023',
  },
  {
    email: '@microsoft.com',
    id: 'ac6445ec-76b2-325b-58e8-28340396c3ff',
    blocked_at: '04/06/2023',
  },
];
