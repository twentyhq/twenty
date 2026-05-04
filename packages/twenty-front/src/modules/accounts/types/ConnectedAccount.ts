import { type CalendarChannel } from '@/accounts/types/CalendarChannel';
import { type ImapSmtpCaldavAccount } from '@/accounts/types/ImapSmtpCaldavAccount';
import { type ConnectedAccountProvider } from 'twenty-shared/types';
import { type MessageChannel } from './MessageChannel';

export type ConnectedAccount = {
  id: string;
  handle: string;
  provider: ConnectedAccountProvider;
  authFailedAt: string | null;
  scopes: string[] | null;
  handleAliases: string[] | null;
  lastSignedInAt: string | null;
  userWorkspaceId: string;
  applicationConnectionProviderId: string | null;
  name: string | null;
  // Connection-row visibility — distinct from the `scopes` array above
  // (those are upstream-granted OAuth permissions).
  visibility: 'user' | 'workspace';
  lastCredentialsRefreshedAt: string | null;
  connectionParameters: ImapSmtpCaldavAccount | null;
  createdAt: string;
  updatedAt: string;
  messageChannels: MessageChannel[];
  calendarChannels: CalendarChannel[];
  __typename: 'ConnectedAccount';
};
