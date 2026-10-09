import { HttpResponse, graphql } from 'msw';
import { fn } from 'storybook/test';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getEmptyPageInfo } from '@/object-record/cache/utils/getEmptyPageInfo';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedApolloClient } from '~/testing/mockedApolloClient';
import {
  mockCurrentWorkspace,
  mockedWorkspaceMemberData,
} from '~/testing/mock-data/users';

const MY_USER_WORKSPACE_ID = '20202020-1a2b-4c3d-8e4f-000000000001';
const TEAMMATE_USER_WORKSPACE_ID = '20202020-1a2b-4c3d-8e4f-000000000002';
const FATHOM_APPLICATION_ID = '20202020-1a2b-4c3d-8e4f-000000000021';
const GRANOLA_APPLICATION_ID = '20202020-1a2b-4c3d-8e4f-000000000022';
const CREATED_AT = '2026-09-01T00:00:00.000Z';

export const GOOGLE_ACCOUNT_ID = '20202020-1a2b-4c3d-8e4f-000000000011';
export const FATHOM_ONLY_ACCOUNT_ID = '20202020-1a2b-4c3d-8e4f-000000000013';
const FATHOM_ACCOUNT_ID = '20202020-1a2b-4c3d-8e4f-000000000012';
const MICROSOFT_ACCOUNT_ID = '20202020-1a2b-4c3d-8e4f-000000000014';
const MY_SHARED_ACCOUNT_ID = '20202020-1a2b-4c3d-8e4f-000000000015';
const TEAMMATE_ACCOUNT_ID = '20202020-1a2b-4c3d-8e4f-000000000016';
const EMAIL_GROUP_ACCOUNT_ID = '20202020-1a2b-4c3d-8e4f-000000000017';

const buildConnectedAccount = (account: {
  id: string;
  handle: string;
  provider: string;
  userWorkspaceId: string;
  applicationId?: string;
  visibility?: string;
}) => ({
  __typename: 'ConnectedAccountPublicDTO',
  authFailedAt: null,
  authFailedReason: null,
  archivedAt: null,
  scopes: null,
  handleAliases: null,
  lastSignedInAt: null,
  connectionProviderId: null,
  applicationId: null,
  name: null,
  visibility: 'user',
  lastCredentialsRefreshedAt: null,
  connectionParameters: null,
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
  ...account,
});

const buildMessageChannel = (id: string, connectedAccountId: string) => ({
  __typename: 'MessageChannel',
  id,
  handle: 'mailbox',
  displayName: null,
  visibility: 'SHARE_EVERYTHING',
  type: 'EMAIL',
  isContactAutoCreationEnabled: true,
  contactAutoCreationPolicy: 'SENT',
  messageFolderImportPolicy: 'ALL_FOLDERS',
  excludeNonProfessionalEmails: false,
  excludeGroupEmails: false,
  isSyncEnabled: true,
  syncStatus: 'ACTIVE',
  syncStage: 'MESSAGE_LIST_FETCH_PENDING',
  syncStageStartedAt: null,
  connectedAccountId,
  connectedAccount: {
    __typename: 'ConnectedAccountHandleDTO',
    id: connectedAccountId,
    handle: 'mailbox',
  },
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
});

const buildCalendarChannel = (id: string, connectedAccountId: string) => ({
  __typename: 'CalendarChannel',
  id,
  handle: 'calendar',
  visibility: 'SHARE_EVERYTHING',
  isContactAutoCreationEnabled: false,
  contactAutoCreationPolicy: 'AS_PARTICIPANT_AND_ORGANIZER',
  isSyncEnabled: true,
  syncStatus: 'ACTIVE',
  syncStage: 'CALENDAR_EVENT_LIST_FETCH_PENDING',
  syncStageStartedAt: null,
  connectedAccountId,
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
});

const CONNECTED_ACCOUNTS = [
  buildConnectedAccount({
    id: GOOGLE_ACCOUNT_ID,
    handle: 'tim@apple.dev',
    provider: 'google',
    userWorkspaceId: MY_USER_WORKSPACE_ID,
  }),
  buildConnectedAccount({
    id: FATHOM_ACCOUNT_ID,
    handle: 'Tim@Apple.dev',
    provider: 'app',
    userWorkspaceId: MY_USER_WORKSPACE_ID,
    applicationId: FATHOM_APPLICATION_ID,
  }),
  buildConnectedAccount({
    id: FATHOM_ONLY_ACCOUNT_ID,
    handle: 'notes@apple.dev',
    provider: 'app',
    userWorkspaceId: MY_USER_WORKSPACE_ID,
    applicationId: FATHOM_APPLICATION_ID,
  }),
  buildConnectedAccount({
    id: MICROSOFT_ACCOUNT_ID,
    handle: 'tim@outlook.com',
    provider: 'microsoft',
    userWorkspaceId: MY_USER_WORKSPACE_ID,
  }),
  buildConnectedAccount({
    id: MY_SHARED_ACCOUNT_ID,
    handle: 'sales@apple.dev',
    provider: 'app',
    userWorkspaceId: MY_USER_WORKSPACE_ID,
    applicationId: FATHOM_APPLICATION_ID,
    visibility: 'workspace',
  }),
  buildConnectedAccount({
    id: TEAMMATE_ACCOUNT_ID,
    handle: 'tim@apple.dev',
    provider: 'app',
    userWorkspaceId: TEAMMATE_USER_WORKSPACE_ID,
    applicationId: GRANOLA_APPLICATION_ID,
    visibility: 'workspace',
  }),
  buildConnectedAccount({
    id: EMAIL_GROUP_ACCOUNT_ID,
    handle: 'support@apple.dev',
    provider: 'email_group',
    userWorkspaceId: MY_USER_WORKSPACE_ID,
    visibility: 'workspace',
  }),
];

const MESSAGE_CHANNELS = [
  buildMessageChannel(
    '20202020-1a2b-4c3d-8e4f-000000000031',
    GOOGLE_ACCOUNT_ID,
  ),
  buildMessageChannel(
    '20202020-1a2b-4c3d-8e4f-000000000032',
    FATHOM_ONLY_ACCOUNT_ID,
  ),
  buildMessageChannel(
    '20202020-1a2b-4c3d-8e4f-000000000033',
    MICROSOFT_ACCOUNT_ID,
  ),
];

const CALENDAR_CHANNELS = [
  buildCalendarChannel(
    '20202020-1a2b-4c3d-8e4f-000000000041',
    GOOGLE_ACCOUNT_ID,
  ),
  buildCalendarChannel(
    '20202020-1a2b-4c3d-8e4f-000000000042',
    MICROSOFT_ACCOUNT_ID,
  ),
];

const deletedAccountIds = new Set<string>();

export const deleteConnectedAccount = fn();

export const ACCOUNT_GROUPS_GRAPHQL_HANDLERS = [
  graphql.query('MyConnectedAccounts', () =>
    HttpResponse.json({
      data: {
        myConnectedAccounts: CONNECTED_ACCOUNTS.filter(
          (account) => !deletedAccountIds.has(account.id),
        ),
      },
    }),
  ),
  graphql.query('MyMessageChannels', () =>
    HttpResponse.json({
      data: {
        myMessageChannels: MESSAGE_CHANNELS.filter(
          (channel) => !deletedAccountIds.has(channel.connectedAccountId),
        ),
      },
    }),
  ),
  graphql.query('MyCalendarChannels', () =>
    HttpResponse.json({
      data: {
        myCalendarChannels: CALENDAR_CHANNELS.filter(
          (channel) => !deletedAccountIds.has(channel.connectedAccountId),
        ),
      },
    }),
  ),
  graphql.mutation('DeleteConnectedAccount', ({ variables }) => {
    deleteConnectedAccount(variables.id);
    deletedAccountIds.add(variables.id);

    return HttpResponse.json({
      data: {
        deleteConnectedAccount: {
          __typename: 'ConnectedAccountPublicDTO',
          id: variables.id,
        },
      },
    });
  }),
  graphql.query('FindManyBlocklists', () =>
    HttpResponse.json({
      data: {
        blocklists: {
          __typename: 'BlocklistConnection',
          edges: [],
          pageInfo: getEmptyPageInfo(),
          totalCount: 0,
        },
      },
    }),
  ),
  ...graphqlMocks.handlers,
];

export const seedAccountGroupsStory = async () => {
  deletedAccountIds.clear();
  deleteConnectedAccount.mockClear();
  await mockedApolloClient.clearStore();

  const previousWorkspace = jotaiStore.get(currentWorkspaceState.atom);
  const previousWorkspaceMember = jotaiStore.get(
    currentWorkspaceMemberState.atom,
  );

  jotaiStore.set(currentWorkspaceState.atom, {
    ...mockCurrentWorkspace,
    installedApplications: [
      {
        id: FATHOM_APPLICATION_ID,
        universalIdentifier: FATHOM_APPLICATION_ID,
        name: 'Fathom',
        logoUrl: null,
      },
      {
        id: GRANOLA_APPLICATION_ID,
        universalIdentifier: GRANOLA_APPLICATION_ID,
        name: 'Granola',
        logoUrl: null,
      },
    ],
    featureFlags: [
      {
        key: FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
        value: true,
      },
    ],
  });
  jotaiStore.set(currentWorkspaceMemberState.atom, {
    ...mockedWorkspaceMemberData,
    userWorkspaceId: MY_USER_WORKSPACE_ID,
  });

  return () => {
    jotaiStore.set(currentWorkspaceState.atom, previousWorkspace);
    jotaiStore.set(currentWorkspaceMemberState.atom, previousWorkspaceMember);
  };
};
