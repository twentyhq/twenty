import { CalendarChannel } from '@/accounts/types/CalendarChannel';

import { ConnectedAccountProvider } from 'twenty-shared';
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
  __typename: 'ConnectedAccount';
};
