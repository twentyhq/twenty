import { type CalendarChannel } from '@/accounts/types/CalendarChannel';
import { type ClientConfig } from '@/client-config/types/ClientConfig';
import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { type MessageFolder } from '@/accounts/types/MessageFolder';
import { graphql, HttpResponse } from 'msw';
import { fn } from 'storybook/test';
import {
  MessageFolderImportPolicy,
  MessageFolderPendingSyncAction,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type PermissionFlagType } from '~/generated-metadata/graphql';
import {
  MOCKED_GOOGLE_CONNECTED_ACCOUNT,
  MOCKED_OUTLOOK_CALENDAR_ACCOUNT,
} from '~/pages/settings/accounts/__stories__/mockedConnectedAccounts';
import { getAppPreferencesMocks } from '~/pages/settings/app-preferences/__stories__/mockedAppPreferencesData';

export const MOCKED_SECOND_GOOGLE_ACCOUNT: ConnectedAccount = {
  ...MOCKED_GOOGLE_CONNECTED_ACCOUNT,
  id: 'second-google-account',
  handle: 'second@example.com',
  messageChannels: [
    {
      ...MOCKED_GOOGLE_CONNECTED_ACCOUNT.messageChannels[0],
      id: 'second-google-message-channel',
      handle: 'second@example.com',
      connectedAccountId: 'second-google-account',
      connectedAccount: {
        id: 'second-google-account',
        handle: 'second@example.com',
      },
      messageFolderImportPolicy: MessageFolderImportPolicy.SELECTED_FOLDERS,
    },
  ],
  calendarChannels: [
    {
      ...MOCKED_GOOGLE_CONNECTED_ACCOUNT.calendarChannels[0],
      id: 'second-google-calendar-channel',
      handle: 'second@example.com',
      connectedAccountId: 'second-google-account',
    },
  ],
};

export const MOCKED_SECOND_OUTLOOK_ACCOUNT: ConnectedAccount = {
  ...MOCKED_OUTLOOK_CALENDAR_ACCOUNT,
  id: 'second-outlook-account',
  handle: 'second@outlook.com',
  calendarChannels: [
    {
      ...MOCKED_OUTLOOK_CALENDAR_ACCOUNT.calendarChannels[0],
      id: 'second-outlook-calendar-channel',
      handle: 'second@outlook.com',
      connectedAccountId: 'second-outlook-account',
      isContactAutoCreationEnabled: false,
    },
  ],
};

const MOCKED_FOLDERS: MessageFolder[] = [
  {
    id: 'first-google-folder',
    name: 'First account folder',
    messageChannelId: MOCKED_GOOGLE_CONNECTED_ACCOUNT.messageChannels[0].id,
  },
  {
    id: 'second-google-folder',
    name: 'Second account folder',
    messageChannelId: MOCKED_SECOND_GOOGLE_ACCOUNT.messageChannels[0].id,
  },
].map((folder) => ({
  ...folder,
  isSynced: false,
  isSentFolder: false,
  parentFolderId: null,
  externalId: null,
  pendingSyncAction: MessageFolderPendingSyncAction.NONE,
  createdAt: '2026-09-23T00:00:00.000Z',
  updatedAt: '2026-09-23T00:00:00.000Z',
  __typename: 'MessageFolder',
}));

type MessageChannelUpdate = { id: string; update: Partial<MessageChannel> };
type CalendarChannelUpdate = { id: string; update: Partial<CalendarChannel> };
type MessageFolderUpdate = { ids: string[]; update: { isSynced: boolean } };

export const messageChannelUpdates =
  fn<(input: MessageChannelUpdate) => void>();
export const calendarChannelUpdates =
  fn<(input: CalendarChannelUpdate) => void>();
export const messageFolderUpdates = fn<(input: MessageFolderUpdate) => void>();
export const messageFolderQueries =
  fn<(messageChannelId: string | undefined) => void>();
export const calendarChannelQueries =
  fn<(connectedAccountId: string | undefined) => void>();

export const getAppPreferencesChannelMocks = ({
  accounts,
  clientConfig = {},
  permissionFlags,
}: {
  accounts: ConnectedAccount[];
  clientConfig?: Partial<ClientConfig>;
  permissionFlags?: PermissionFlagType[];
}) => {
  let messageChannels: MessageChannel[] = [];
  let calendarChannels: CalendarChannel[] = [];
  let messageFolders: MessageFolder[] = [];
  const reset = () => {
    messageChannels = accounts
      .flatMap((account) => account.messageChannels)
      .map((channel) => ({ ...channel }));
    calendarChannels = accounts
      .flatMap((account) => account.calendarChannels)
      .map((channel) => ({ ...channel }));
    messageFolders = MOCKED_FOLDERS.map((folder) => ({ ...folder }));
    messageChannelUpdates.mockClear();
    calendarChannelUpdates.mockClear();
    messageFolderUpdates.mockClear();
    messageFolderQueries.mockClear();
    calendarChannelQueries.mockClear();
  };
  reset();

  return {
    reset,
    handlers: [
      graphql.query('MyMessageChannels', () =>
        HttpResponse.json({ data: { myMessageChannels: messageChannels } }),
      ),
      graphql.query<
        { myCalendarChannels: CalendarChannel[] },
        { connectedAccountId?: string }
      >('MyCalendarChannels', ({ variables }) => {
        calendarChannelQueries(variables.connectedAccountId);
        return HttpResponse.json({
          data: {
            myCalendarChannels: calendarChannels.filter((channel) =>
              isDefined(variables.connectedAccountId)
                ? channel.connectedAccountId === variables.connectedAccountId
                : accounts.some(
                    (account) =>
                      account.id === channel.connectedAccountId &&
                      account.userWorkspaceId === 'user-workspace',
                  ),
            ),
          },
        });
      }),
      graphql.mutation<
        { updateMessageChannel: MessageChannel },
        { input: MessageChannelUpdate }
      >('UpdateMessageChannel', ({ variables }) => {
        messageChannelUpdates(variables.input);
        const channel = messageChannels.find(
          (candidate) => candidate.id === variables.input.id,
        );
        if (!isDefined(channel)) {
          return HttpResponse.json({
            errors: [{ message: 'Message channel not found' }],
          });
        }
        Object.assign(channel, variables.input.update);
        return HttpResponse.json({ data: { updateMessageChannel: channel } });
      }),
      graphql.mutation<
        { updateCalendarChannel: CalendarChannel },
        { input: CalendarChannelUpdate }
      >('UpdateCalendarChannel', ({ variables }) => {
        calendarChannelUpdates(variables.input);
        const channel = calendarChannels.find(
          (candidate) => candidate.id === variables.input.id,
        );
        if (!isDefined(channel)) {
          return HttpResponse.json({
            errors: [{ message: 'Calendar channel not found' }],
          });
        }
        Object.assign(channel, variables.input.update);
        return HttpResponse.json({ data: { updateCalendarChannel: channel } });
      }),
      graphql.query<
        { myMessageFolders: MessageFolder[] },
        { messageChannelId?: string }
      >('MyMessageFolders', ({ variables }) => {
        messageFolderQueries(variables.messageChannelId);
        return HttpResponse.json({
          data: {
            myMessageFolders: messageFolders.filter(
              (folder) =>
                folder.messageChannelId === variables.messageChannelId,
            ),
          },
        });
      }),
      graphql.mutation<
        { updateMessageFolders: MessageFolder[] },
        { input: MessageFolderUpdate }
      >('UpdateMessageFolders', ({ variables }) => {
        messageFolderUpdates(variables.input);
        const folders = messageFolders.filter((folder) =>
          variables.input.ids.includes(folder.id),
        );
        folders.forEach((folder) =>
          Object.assign(folder, variables.input.update),
        );
        return HttpResponse.json({ data: { updateMessageFolders: folders } });
      }),
      ...getAppPreferencesMocks({ accounts, clientConfig, permissionFlags })
        .handlers,
    ],
  };
};
