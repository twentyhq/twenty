import { CalendarChannel } from '@/accounts/types/CalendarChannel';
import { ImapSmtpCaldavAccount } from '@/accounts/types/ImapSmtpCaldavAccount';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { MessageChannel } from './MessageChannel';

export type ConnectedAccount = {
  id: string;
  handle: string;
  provider: ConnectedAccountProvider;
  accessToken: string;
  refreshToken: string;
  accountOwnerId: string;
  lastSyncHistoryId: string;
  authFailedAt: Date | null;
  messageChannels: MessageChannel[];
  calendarChannels: CalendarChannel[];
  scopes: string[] | null;
  connectionParameters?: ImapSmtpCaldavAccount;
  __typename: 'ConnectedAccount';
};
