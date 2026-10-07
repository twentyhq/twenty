import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { mockedDropdownConnectedAccount } from '@/settings/accounts/components/__stories__/mockedDropdownConnectedAccount';
import {
  CalendarChannelSyncStage,
  CalendarChannelSyncStatus,
  ConnectedAccountProvider,
  MessageChannelContactAutoCreationPolicy,
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
  MessageChannelType,
  MessageFolderImportPolicy,
} from 'twenty-shared/types';
import { MessageChannelVisibility } from '~/generated-metadata/graphql';

const MOCKED_EMAIL_CHANNEL: MessageChannel = {
  id: 'google-email-channel',
  handle: 'alex@example.com',
  displayName: null,
  visibility: MessageChannelVisibility.SHARE_EVERYTHING,
  type: MessageChannelType.EMAIL,
  isContactAutoCreationEnabled: false,
  contactAutoCreationPolicy: MessageChannelContactAutoCreationPolicy.NONE,
  messageFolderImportPolicy: MessageFolderImportPolicy.ALL_FOLDERS,
  excludeNonProfessionalEmails: false,
  excludeGroupEmails: false,
  isSyncEnabled: true,
  syncStatus: MessageChannelSyncStatus.ACTIVE,
  syncStage: MessageChannelSyncStage.MESSAGES_IMPORT_PENDING,
  syncStageStartedAt: null,
  connectedAccountId: 'google-connected-account',
  connectedAccount: {
    id: 'google-connected-account',
    handle: 'alex@example.com',
  },
  createdAt: '2026-09-23T00:00:00.000Z',
  updatedAt: '2026-09-23T00:00:00.000Z',
  __typename: 'MessageChannel',
};

export const MOCKED_GOOGLE_CONNECTED_ACCOUNT: ConnectedAccount = {
  ...mockedDropdownConnectedAccount,
  id: 'google-connected-account',
  handle: 'alex@example.com',
  provider: ConnectedAccountProvider.GOOGLE,
  messageChannels: [MOCKED_EMAIL_CHANNEL],
  calendarChannels: [
    {
      ...mockedDropdownConnectedAccount.calendarChannels[0],
      id: 'google-calendar-channel',
      handle: 'alex@example.com',
      connectedAccountId: 'google-connected-account',
      syncStage: CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_PENDING,
      syncStatus: CalendarChannelSyncStatus.ACTIVE,
    },
  ],
};

export const MOCKED_OUTLOOK_CALENDAR_ACCOUNT: ConnectedAccount = {
  ...mockedDropdownConnectedAccount,
  id: 'outlook-connected-account',
  handle: 'robin@example.com',
  provider: ConnectedAccountProvider.MICROSOFT,
  calendarChannels: [
    {
      ...MOCKED_GOOGLE_CONNECTED_ACCOUNT.calendarChannels[0],
      id: 'outlook-calendar-channel',
      handle: 'robin@example.com',
      connectedAccountId: 'outlook-connected-account',
    },
  ],
};

export const MOCKED_PAUSED_GOOGLE_ACCOUNT: ConnectedAccount = {
  ...MOCKED_GOOGLE_CONNECTED_ACCOUNT,
  id: 'paused-connected-account',
  handle: 'paused@example.com',
  archivedAt: '2026-09-24T00:00:00.000Z',
  messageChannels: [],
  calendarChannels: [
    {
      ...MOCKED_GOOGLE_CONNECTED_ACCOUNT.calendarChannels[0],
      id: 'paused-calendar-channel',
      handle: 'paused@example.com',
      connectedAccountId: 'paused-connected-account',
      isSyncEnabled: false,
    },
  ],
};

export const MOCKED_SETTINGS_CONNECTED_ACCOUNTS: ConnectedAccount[] = [
  MOCKED_GOOGLE_CONNECTED_ACCOUNT,
  MOCKED_OUTLOOK_CALENDAR_ACCOUNT,
  MOCKED_PAUSED_GOOGLE_ACCOUNT,
  mockedDropdownConnectedAccount,
];
