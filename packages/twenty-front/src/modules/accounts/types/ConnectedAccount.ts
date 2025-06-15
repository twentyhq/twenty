import { CalendarChannel } from '@/accounts/types/CalendarChannel';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { LiteralUnion } from 'type-fest';
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
  customConnectionParams?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/ban-types
  connectionType: LiteralUnion<'OAuth2' | 'IMAP', string>;
  __typename: 'ConnectedAccount';
};
