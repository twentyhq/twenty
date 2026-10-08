import { type CalendarChannel } from '@/accounts/types/CalendarChannel';
import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { type MessageFolder } from '@/accounts/types/MessageFolder';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isCookieAuthActiveState } from '@/auth/states/isCookieAuthActiveState';
import { getEmptyPageInfo } from '@/object-record/cache/utils/getEmptyPageInfo';
import { settingsAccountsSelectedMessageChannelState } from '@/settings/accounts/states/settingsAccountsSelectedMessageChannelState';
import { type ConsolidatedConnectedAccount } from '@/settings/accounts/types/ConsolidatedConnectedAccount';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import {
  graphql,
  HttpResponse,
  type GraphQLQuery,
  type GraphQLResponseResolver,
} from 'msw';
import { fn } from 'storybook/test';
import {
  CalendarChannelContactAutoCreationPolicy,
  CalendarChannelSyncStage,
  CalendarChannelSyncStatus,
  ConnectedAccountProvider,
  MessageChannelContactAutoCreationPolicy,
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
  MessageChannelType,
  MessageFolderImportPolicy,
  MessageFolderPendingSyncAction,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  CalendarChannelVisibility,
  FeatureFlagKey,
  MessageChannelVisibility,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { graphqlMocks } from '~/testing/graphqlMocks';
import {
  mockCurrentWorkspace,
  mockedUserData,
  mockedWorkspaceMemberData,
} from '~/testing/mock-data/users';
import { mockedApolloClient } from '~/testing/mockedApolloClient';

export const GOOGLE_ACCOUNT_ID = '11111111-1111-4111-8111-111111111111';
export const FATHOM_ACCOUNT_ID = '22222222-2222-4222-8222-222222222222';
export const SHARED_GOOGLE_ACCOUNT_ID = '33333333-3333-4333-8333-333333333333';
export const FATHOM_APPLICATION_ID = '44444444-4444-4444-8444-444444444444';
export const FATHOM_PROVIDER_ID = '55555555-5555-4555-8555-555555555555';
export const GOOGLE_MESSAGE_CHANNEL_ID = '66666666-6666-4666-8666-666666666666';
export const GOOGLE_CALENDAR_CHANNEL_ID =
  '77777777-7777-4777-8777-777777777777';
export const SHARED_MESSAGE_CHANNEL_ID = '88888888-8888-4888-8888-888888888888';
export const SHARED_CALENDAR_CHANNEL_ID =
  '99999999-9999-4999-8999-999999999999';
export const ACCOUNT_GROUP_ID = 'email:tim@apple.dev';
export const ACCOUNT_GROUP_PATH = `/settings/accounts/detail/${encodeURIComponent(ACCOUNT_GROUP_ID)}`;
const CREATED_AT = '2026-10-01T00:00:00.000Z';

export const createConsolidatedAccount = (
  overrides: Partial<ConsolidatedConnectedAccount> = {},
): ConsolidatedConnectedAccount => ({
  __typename: 'ConnectedAccountPublicDTO',
  id: GOOGLE_ACCOUNT_ID,
  handle: 'Tim@Apple.dev',
  provider: ConnectedAccountProvider.GOOGLE,
  applicationId: null,
  connectionProviderId: null,
  userWorkspaceId: 'user-workspace',
  visibility: 'user',
  name: 'My Google connection',
  authFailedAt: null,
  authFailedReason: null,
  archivedAt: null,
  scopes: [
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/calendar',
  ],
  handleAliases: [],
  lastSignedInAt: null,
  lastCredentialsRefreshedAt: null,
  connectionParameters: null,
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
  ...overrides,
});

export const GOOGLE_ACCOUNT = createConsolidatedAccount();
export const FATHOM_ACCOUNT = createConsolidatedAccount({
  id: FATHOM_ACCOUNT_ID,
  handle: 'tim@apple.dev',
  provider: ConnectedAccountProvider.APP,
  applicationId: FATHOM_APPLICATION_ID,
  connectionProviderId: FATHOM_PROVIDER_ID,
  name: 'My Fathom connection',
  scopes: ['recordings:read'],
});
export const SHARED_GOOGLE_ACCOUNT = createConsolidatedAccount({
  id: SHARED_GOOGLE_ACCOUNT_ID,
  handle: 'tim@apple.dev',
  userWorkspaceId: 'another-member',
  visibility: 'workspace',
  name: 'Team Google connection',
});

export const createConsolidatedMessageChannel = (
  overrides: Partial<MessageChannel> = {},
): MessageChannel => ({
  __typename: 'MessageChannel',
  id: GOOGLE_MESSAGE_CHANNEL_ID,
  handle: 'tim@apple.dev',
  displayName: null,
  connectedAccountId: GOOGLE_ACCOUNT_ID,
  connectedAccount: { id: GOOGLE_ACCOUNT_ID, handle: 'tim@apple.dev' },
  visibility: MessageChannelVisibility.SHARE_EVERYTHING,
  type: MessageChannelType.EMAIL,
  isContactAutoCreationEnabled: true,
  contactAutoCreationPolicy: MessageChannelContactAutoCreationPolicy.SENT,
  messageFolderImportPolicy: MessageFolderImportPolicy.SELECTED_FOLDERS,
  excludeNonProfessionalEmails: false,
  excludeGroupEmails: false,
  isSyncEnabled: true,
  syncStatus: MessageChannelSyncStatus.ACTIVE,
  syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
  syncStageStartedAt: null,
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
  ...overrides,
});

export const createConsolidatedCalendarChannel = (
  overrides: Partial<CalendarChannel> = {},
): CalendarChannel => ({
  __typename: 'CalendarChannel',
  id: GOOGLE_CALENDAR_CHANNEL_ID,
  handle: 'tim@apple.dev',
  connectedAccountId: GOOGLE_ACCOUNT_ID,
  visibility: CalendarChannelVisibility.SHARE_EVERYTHING,
  isContactAutoCreationEnabled: false,
  contactAutoCreationPolicy:
    CalendarChannelContactAutoCreationPolicy.AS_PARTICIPANT_AND_ORGANIZER,
  isSyncEnabled: true,
  syncStatus: CalendarChannelSyncStatus.ACTIVE,
  syncStage: CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
  syncStageStartedAt: null,
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
  ...overrides,
});

const INSTALLED_APPLICATIONS = [
  {
    id: FATHOM_APPLICATION_ID,
    universalIdentifier: FATHOM_APPLICATION_ID,
    name: 'Fathom',
    logoUrl: null,
  },
];

type ConsolidatedAccountsStoryOptions = {
  permissionFlags?: PermissionFlagType[];
  isConsolidationEnabled?: boolean;
};

const getStoryWorkspace = ({
  isConsolidationEnabled = true,
}: ConsolidatedAccountsStoryOptions) => ({
  ...mockCurrentWorkspace,
  customDomain: null,
  billingCustomer: null,
  defaultRole: null,
  aiAdditionalInstructions: null,
  editableProfileFields: null,
  installedApplications: INSTALLED_APPLICATIONS,
  currentBillingSubscription: {
    ...mockCurrentWorkspace.currentBillingSubscription,
    cancelAt: null,
  },
  billingSubscriptions: mockCurrentWorkspace.billingSubscriptions.map(
    (subscription) => ({ ...subscription, cancelAt: null }),
  ),
  featureFlags: [
    {
      key: FeatureFlagKey.IS_CONNECTED_ACCOUNTS_CONSOLIDATION_ENABLED,
      value: isConsolidationEnabled,
    },
  ],
});

export const prepareConsolidatedAccountsStory = async (
  options: ConsolidatedAccountsStoryOptions = {},
) => {
  const previousState = {
    workspace: jotaiStore.get(currentWorkspaceState.atom),
    userWorkspace: jotaiStore.get(currentUserWorkspaceState.atom),
    member: jotaiStore.get(currentWorkspaceMemberState.atom),
    logged: jotaiStore.get(isCookieAuthActiveState.atom),
    selectedChannel: jotaiStore.get(
      settingsAccountsSelectedMessageChannelState.atom,
    ),
  };

  await mockedApolloClient.clearStore();
  jotaiStore.set(currentWorkspaceState.atom, getStoryWorkspace(options));
  jotaiStore.set(currentWorkspaceMemberState.atom, {
    ...mockedWorkspaceMemberData,
    userWorkspaceId: 'user-workspace',
  });
  jotaiStore.set(currentUserWorkspaceState.atom, {
    ...mockedUserData.currentUserWorkspace,
    isImpersonating: false,
    permissionFlags: options.permissionFlags ?? [
      PermissionFlagType.CONNECTED_ACCOUNTS,
    ],
  });
  jotaiStore.set(isCookieAuthActiveState.atom, true);
  jotaiStore.set(settingsAccountsSelectedMessageChannelState.atom, null);

  return () => {
    jotaiStore.set(currentWorkspaceState.atom, previousState.workspace);
    jotaiStore.set(currentUserWorkspaceState.atom, previousState.userWorkspace);
    jotaiStore.set(currentWorkspaceMemberState.atom, previousState.member);
    jotaiStore.set(isCookieAuthActiveState.atom, previousState.logged);
    jotaiStore.set(
      settingsAccountsSelectedMessageChannelState.atom,
      previousState.selectedChannel,
    );
  };
};

export const createConsolidatedAccountsScenario = ({
  accounts = [GOOGLE_ACCOUNT, FATHOM_ACCOUNT],
  messageChannels = [createConsolidatedMessageChannel()],
  calendarChannels = [createConsolidatedCalendarChannel()],
  disconnectFailureId,
  deleteFailureId,
  accountsReadFailures = 0,
  providersReadFailures = 0,
  channelsReadFailures = 0,
  options = {},
}: {
  accounts?: ConsolidatedConnectedAccount[];
  messageChannels?: MessageChannel[];
  calendarChannels?: CalendarChannel[];
  disconnectFailureId?: string;
  deleteFailureId?: string;
  accountsReadFailures?: number;
  providersReadFailures?: number;
  channelsReadFailures?: number;
  options?: ConsolidatedAccountsStoryOptions;
} = {}) => {
  let currentAccounts = structuredClone(accounts);
  let currentMessageChannels = structuredClone(messageChannels);
  let currentCalendarChannels = structuredClone(calendarChannels);
  let currentFolders: MessageFolder[] = [];
  let failedDisconnect = false;
  let failedDelete = false;
  let remainingAccountsReadFailures = accountsReadFailures;
  let remainingProvidersReadFailures = providersReadFailures;
  let remainingChannelsReadFailures = channelsReadFailures;
  const disconnect = fn<(id: string) => void>();
  const deleteConnection = fn<(id: string) => void>();
  const updateMessageChannel =
    fn<(input: { id: string; update: Partial<MessageChannel> }) => void>();
  const updateCalendarChannel =
    fn<(input: { id: string; update: Partial<CalendarChannel> }) => void>();
  const updateFolders =
    fn<(input: { ids: string[]; update: { isSynced: boolean } }) => void>();
  const readChannels = fn<(ids: string[]) => void>();
  const readProviders = fn<(applicationId: string) => void>();
  const staleChannelRead = fn();
  const nativeFolderNames = ['Personal inbox', 'Team inbox'];

  const reset = () => {
    currentAccounts = structuredClone(accounts);
    currentMessageChannels = structuredClone(messageChannels);
    currentCalendarChannels = structuredClone(calendarChannels);
    currentFolders = messageChannels.map((channel, index) => ({
      __typename: 'MessageFolder',
      id: `aaaaaaaa-aaaa-4aaa-8aaa-${String(index + 1).padStart(12, '0')}`,
      name: nativeFolderNames[index] ?? `Inbox ${index + 1}`,
      messageChannelId: channel.id,
      isSynced: true,
      isSentFolder: false,
      parentFolderId: null,
      externalId: null,
      pendingSyncAction: MessageFolderPendingSyncAction.NONE,
      createdAt: CREATED_AT,
      updatedAt: CREATED_AT,
    }));
    failedDisconnect = false;
    failedDelete = false;
    remainingAccountsReadFailures = accountsReadFailures;
    remainingProvidersReadFailures = providersReadFailures;
    remainingChannelsReadFailures = channelsReadFailures;
    for (const mock of [
      disconnect,
      deleteConnection,
      updateMessageChannel,
      updateCalendarChannel,
      updateFolders,
      readChannels,
      readProviders,
      staleChannelRead,
    ]) {
      mock.mockClear();
    }
  };
  reset();

  const readAccounts: GraphQLResponseResolver<GraphQLQuery> = () => {
    if (remainingAccountsReadFailures > 0) {
      remainingAccountsReadFailures -= 1;
      return HttpResponse.json({
        errors: [{ message: 'Connections could not be loaded' }],
      });
    }
    return HttpResponse.json({
      data: { myConnectedAccounts: currentAccounts },
    });
  };

  const mocks = {
    handlers: [
      graphql.query('GetCurrentUser', () =>
        HttpResponse.json({
          data: {
            currentUser: {
              ...mockedUserData,
              previousOnboardingStatus: null,
              isWorkspaceCreator: false,
              deletedWorkspaceMembers: [],
              workspaceMember: {
                ...mockedWorkspaceMemberData,
                userWorkspaceId: 'user-workspace',
                uiScale: 'Default',
                openRecordIn: 'SIDE_PANEL',
                calendarStartDay: null,
                numberFormat: null,
              },
              workspaceMembers: [
                {
                  ...mockedWorkspaceMemberData,
                  userWorkspaceId: 'user-workspace',
                },
              ],
              currentWorkspace: getStoryWorkspace(options),
              currentUserWorkspace: {
                ...mockedUserData.currentUserWorkspace,
                id: 'user-workspace',
                isImpersonating: false,
                permissionFlags: options.permissionFlags ?? [
                  PermissionFlagType.CONNECTED_ACCOUNTS,
                ],
              },
            },
          },
        }),
      ),
      graphql.query('FindManyBlocklists', () =>
        HttpResponse.json({
          data: {
            blocklists: {
              edges: [],
              pageInfo: getEmptyPageInfo(),
              totalCount: 0,
            },
          },
        }),
      ),
      graphql.query('MyConsolidatedConnectedAccounts', readAccounts),
      graphql.query('MyConnectedAccounts', () =>
        HttpResponse.json({
          data: { myConnectedAccounts: currentAccounts },
        }),
      ),
      graphql.query<GraphQLQuery, Record<string, string>>(
        'ConsolidatedAccountChannels',
        ({ variables }) => {
          const ids = Object.values(variables);
          readChannels(ids);
          if (
            ids.some(
              (id) => !currentAccounts.some((account) => account.id === id),
            )
          ) {
            staleChannelRead(ids);
            return HttpResponse.json({
              errors: [{ message: 'Connection is no longer available' }],
            });
          }
          if (remainingChannelsReadFailures > 0) {
            remainingChannelsReadFailures -= 1;
            return HttpResponse.json({
              errors: [{ message: 'Channels unavailable' }],
            });
          }
          const data: Record<string, MessageChannel[] | CalendarChannel[]> = {};
          Object.entries(variables).forEach(([variableName, id]) => {
            const index = variableName.slice('connectedAccountId'.length);
            data[`messageChannels${index}`] = currentMessageChannels.filter(
              (channel) => channel.connectedAccountId === id,
            );
            data[`calendarChannels${index}`] = currentCalendarChannels.filter(
              (channel) => channel.connectedAccountId === id,
            );
          });
          return HttpResponse.json({ data });
        },
      ),
      graphql.query<GraphQLQuery, { connectedAccountId?: string }>(
        'MyMessageChannels',
        ({ variables }) =>
          HttpResponse.json({
            data: {
              myMessageChannels: currentMessageChannels.filter(
                (channel) =>
                  !isDefined(variables.connectedAccountId) ||
                  channel.connectedAccountId === variables.connectedAccountId,
              ),
            },
          }),
      ),
      graphql.query<GraphQLQuery, { connectedAccountId?: string }>(
        'MyCalendarChannels',
        ({ variables }) =>
          HttpResponse.json({
            data: {
              myCalendarChannels: currentCalendarChannels.filter((channel) =>
                isDefined(variables.connectedAccountId)
                  ? channel.connectedAccountId === variables.connectedAccountId
                  : currentAccounts.some(
                      (account) =>
                        account.id === channel.connectedAccountId &&
                        account.userWorkspaceId === 'user-workspace',
                    ),
              ),
            },
          }),
      ),
      graphql.query<GraphQLQuery, { messageChannelId?: string }>(
        'MyMessageFolders',
        ({ variables }) =>
          HttpResponse.json({
            data: {
              myMessageFolders: currentFolders.filter(
                (folder) =>
                  !isDefined(variables.messageChannelId) ||
                  folder.messageChannelId === variables.messageChannelId,
              ),
            },
          }),
      ),
      graphql.mutation<
        GraphQLQuery,
        { input: { id: string; update: Partial<MessageChannel> } }
      >('UpdateMessageChannel', ({ variables }) => {
        updateMessageChannel(variables.input);
        currentMessageChannels = currentMessageChannels.map((channel) =>
          channel.id === variables.input.id
            ? { ...channel, ...variables.input.update }
            : channel,
        );
        return HttpResponse.json({
          data: {
            updateMessageChannel: currentMessageChannels.find(
              (channel) => channel.id === variables.input.id,
            ),
          },
        });
      }),
      graphql.mutation<
        GraphQLQuery,
        { input: { id: string; update: Partial<CalendarChannel> } }
      >('UpdateCalendarChannel', ({ variables }) => {
        updateCalendarChannel(variables.input);
        currentCalendarChannels = currentCalendarChannels.map((channel) =>
          channel.id === variables.input.id
            ? { ...channel, ...variables.input.update }
            : channel,
        );
        return HttpResponse.json({
          data: {
            updateCalendarChannel: currentCalendarChannels.find(
              (channel) => channel.id === variables.input.id,
            ),
          },
        });
      }),
      graphql.mutation<
        GraphQLQuery,
        { input: { ids: string[]; update: { isSynced: boolean } } }
      >('UpdateMessageFolders', ({ variables }) => {
        updateFolders(variables.input);
        currentFolders = currentFolders.map((folder) =>
          variables.input.ids.includes(folder.id)
            ? { ...folder, ...variables.input.update }
            : folder,
        );
        return HttpResponse.json({
          data: {
            updateMessageFolders: currentFolders.filter((folder) =>
              variables.input.ids.includes(folder.id),
            ),
          },
        });
      }),
      graphql.mutation<GraphQLQuery, { id: string }>(
        'DisconnectConnectedAccount',
        ({ variables }) => {
          disconnect(variables.id);
          if (variables.id === disconnectFailureId && !failedDisconnect) {
            failedDisconnect = true;
            return HttpResponse.json({
              errors: [
                { message: 'This connection could not be disconnected' },
              ],
            });
          }
          currentAccounts = currentAccounts.map((account) =>
            account.id === variables.id
              ? { ...account, archivedAt: CREATED_AT }
              : account,
          );
          return HttpResponse.json({
            data: {
              disconnectConnectedAccount: {
                __typename: 'ConnectedAccount',
                id: variables.id,
              },
            },
          });
        },
      ),
      graphql.mutation<GraphQLQuery, { id: string }>(
        'DeleteConnectedAccount',
        ({ variables }) => {
          deleteConnection(variables.id);
          if (variables.id === deleteFailureId && !failedDelete) {
            failedDelete = true;
            return HttpResponse.json({
              errors: [{ message: 'This connection could not be deleted' }],
            });
          }
          currentAccounts = currentAccounts.filter(
            (account) => account.id !== variables.id,
          );
          currentMessageChannels = currentMessageChannels.filter(
            (channel) => channel.connectedAccountId !== variables.id,
          );
          currentCalendarChannels = currentCalendarChannels.filter(
            (channel) => channel.connectedAccountId !== variables.id,
          );
          return HttpResponse.json({
            data: {
              deleteConnectedAccount: {
                __typename: 'ConnectedAccount',
                id: variables.id,
              },
            },
          });
        },
      ),
      graphql.query<GraphQLQuery, { applicationId: string }>(
        'ApplicationConnectionProviders',
        ({ variables }) => {
          readProviders(variables.applicationId);
          if (remainingProvidersReadFailures > 0) {
            remainingProvidersReadFailures -= 1;
            return HttpResponse.json({
              errors: [{ message: 'Connection provider unavailable' }],
            });
          }
          return HttpResponse.json({
            data: {
              applicationConnectionProviders:
                variables.applicationId === FATHOM_APPLICATION_ID
                  ? [
                      {
                        __typename: 'ConnectionProviderDTO',
                        id: FATHOM_PROVIDER_ID,
                        applicationId: FATHOM_APPLICATION_ID,
                        type: 'oauth',
                        name: 'fathom',
                        displayName: 'Fathom account',
                        logoUrl: null,
                        oauth: {
                          __typename: 'ConnectionProviderOAuthDTO',
                          scopes: ['recordings:read'],
                          isClientCredentialsConfigured: true,
                        },
                      },
                    ]
                  : [],
            },
          });
        },
      ),
      graphql.mutation('generateTransientToken', () =>
        HttpResponse.json({
          data: {
            generateTransientToken: {
              __typename: 'GenerateTransientToken',
              transientToken: {
                __typename: 'AuthToken',
                token: 'consolidated-reconnect-token',
              },
            },
          },
        }),
      ),
      ...graphqlMocks.handlers,
    ],
  };

  const reconnect = (id: string) => {
    currentAccounts = currentAccounts.map((account) =>
      account.id === id
        ? { ...account, archivedAt: null, authFailedAt: null }
        : account,
    );
  };

  const prepare = async () => {
    reset();
    return prepareConsolidatedAccountsStory(options);
  };

  return {
    mocks,
    prepare,
    reconnect,
    disconnect,
    deleteConnection,
    updateMessageChannel,
    updateCalendarChannel,
    updateFolders,
    readChannels,
    readProviders,
    staleChannelRead,
  };
};
