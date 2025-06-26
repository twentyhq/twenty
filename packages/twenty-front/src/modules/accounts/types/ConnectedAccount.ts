import { CalendarChannel } from '@/accounts/types/CalendarChannel';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { ConnectionParameters } from '~/generated-metadata/graphql';
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
  // TODO: Replace with singular type
  connectionParameters?: {
    IMAP?: ConnectionParameters;
    SMTP?: ConnectionParameters;
    CALDAV?: ConnectionParameters;
  };
  __typename: 'ConnectedAccount';
};
