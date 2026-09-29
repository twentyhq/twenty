import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import {
  CalendarChannelContactAutoCreationPolicy,
  CalendarChannelSyncStage,
  CalendarChannelSyncStatus,
  ConnectedAccountProvider,
} from 'twenty-shared/types';
import { CalendarChannelVisibility } from '~/generated/graphql';

export const mockedDropdownConnectedAccount: ConnectedAccount = {
  id: 'connected-account',
  handle: 'account@example.com',
  provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
  authFailedAt: null,
  archivedAt: null,
  scopes: null,
  handleAliases: null,
  lastSignedInAt: null,
  userWorkspaceId: 'user-workspace',
  connectionProviderId: null,
  name: null,
  visibility: 'user',
  lastCredentialsRefreshedAt: null,
  connectionParameters: null,
  createdAt: '2026-09-23T00:00:00.000Z',
  updatedAt: '2026-09-23T00:00:00.000Z',
  messageChannels: [],
  calendarChannels: [
    {
      id: 'calendar-channel',
      handle: 'account@example.com',
      visibility: CalendarChannelVisibility.SHARE_EVERYTHING,
      isContactAutoCreationEnabled: false,
      contactAutoCreationPolicy: CalendarChannelContactAutoCreationPolicy.NONE,
      isSyncEnabled: true,
      syncStatus: CalendarChannelSyncStatus.NOT_SYNCED,
      syncStage: CalendarChannelSyncStage.PENDING_CONFIGURATION,
      syncStageStartedAt: null,
      connectedAccountId: 'connected-account',
      createdAt: '2026-09-23T00:00:00.000Z',
      updatedAt: '2026-09-23T00:00:00.000Z',
      __typename: 'CalendarChannel',
    },
  ],
  __typename: 'ConnectedAccount',
};
