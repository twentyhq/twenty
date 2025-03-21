import { CalendarChannel } from '@/accounts/types/CalendarChannel';
import { MessageChannel } from './MessageChannel';
import { ConnectedAccountProvider } from 'twenty-shared/types';

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
  __typename: 'ConnectedAccount';
};
