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
} from 'twenty-shared/types';

import { CUSTOM_WORKSPACE_APPLICATION_MOCK } from '@/object-metadata/hooks/__tests__/constants/CustomWorkspaceApplicationMock.test.constant';
import {
  CalendarChannelVisibility,
  MessageChannelVisibility,
} from '~/generated/graphql';
import { SettingsMenuItemScope } from '~/generated-metadata/graphql';

const GOOGLE_ACCOUNT_ID = '20202020-0000-4000-8000-00000000acc1';
const MICROSOFT_ACCOUNT_ID = '20202020-0000-4000-8000-00000000acc2';
const APPLICATION_ACCOUNT_ID = '20202020-0000-4000-8000-00000000acc3';
const APPLICATION_CONNECTION_PROVIDER_ID =
  '20202020-0000-4000-8000-00000000prv1';
const APPLICATION_FRONT_COMPONENT_ID = '20202020-0000-4000-8000-00000000frc1';
const APPLICATION_SETTINGS_MENU_ITEM_ID =
  '20202020-0000-4000-8000-00000000smi1';
export const SCROLLER_APPLICATION_ID = '20202020-0000-4000-8000-00000000app2';
const SCROLLER_CONNECTION_PROVIDER_ID = '20202020-0000-4000-8000-00000000prv2';
const SCROLLER_SETTINGS_MENU_ITEM_ID = '20202020-0000-4000-8000-00000000smi2';
const USER_WORKSPACE_ID = '20202020-0000-4000-8000-00000000usw1';
const TIMESTAMP = '2026-10-06T10:00:00.000Z';

const buildConnectedAccount = ({
  id,
  handle,
  provider,
  applicationId = null,
  connectionProviderId = null,
}: {
  id: string;
  handle: string;
  provider: ConnectedAccountProvider;
  applicationId?: string | null;
  connectionProviderId?: string | null;
}) => ({
  __typename: 'ConnectedAccountPublicDTO',
  id,
  handle,
  provider,
  authFailedAt: null,
  authFailedReason: null,
  archivedAt: null,
  scopes: null,
  handleAliases: null,
  lastSignedInAt: TIMESTAMP,
  userWorkspaceId: USER_WORKSPACE_ID,
  connectionProviderId,
  applicationId,
  name: null,
  visibility: 'user',
  lastCredentialsRefreshedAt: TIMESTAMP,
  connectionParameters: null,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP,
});

export const mockedConnectedAccounts = [
  buildConnectedAccount({
    id: GOOGLE_ACCOUNT_ID,
    handle: 'tim@apple.dev',
    provider: ConnectedAccountProvider.GOOGLE,
  }),
  buildConnectedAccount({
    id: APPLICATION_ACCOUNT_ID,
    handle: 'tim@apple.dev',
    provider: ConnectedAccountProvider.APP,
    applicationId: CUSTOM_WORKSPACE_APPLICATION_MOCK.id,
    connectionProviderId: APPLICATION_CONNECTION_PROVIDER_ID,
  }),
  buildConnectedAccount({
    id: MICROSOFT_ACCOUNT_ID,
    handle: 'tim.apple@outlook.com',
    provider: ConnectedAccountProvider.MICROSOFT,
  }),
];

export const mockedMessageChannels = [
  {
    __typename: 'MessageChannel',
    id: '20202020-0000-4000-8000-00000000msc1',
    handle: 'tim@apple.dev',
    displayName: null,
    visibility: MessageChannelVisibility.SHARE_EVERYTHING,
    type: MessageChannelType.EMAIL,
    isContactAutoCreationEnabled: true,
    contactAutoCreationPolicy: MessageChannelContactAutoCreationPolicy.SENT,
    messageFolderImportPolicy: MessageFolderImportPolicy.ALL_FOLDERS,
    excludeNonProfessionalEmails: true,
    excludeGroupEmails: true,
    isSyncEnabled: true,
    syncStatus: MessageChannelSyncStatus.ACTIVE,
    syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
    syncStageStartedAt: TIMESTAMP,
    connectedAccountId: GOOGLE_ACCOUNT_ID,
    connectedAccount: { id: GOOGLE_ACCOUNT_ID, handle: 'tim@apple.dev' },
    createdAt: TIMESTAMP,
    updatedAt: TIMESTAMP,
  },
  {
    __typename: 'MessageChannel',
    id: '20202020-0000-4000-8000-00000000msc2',
    handle: 'tim.apple@outlook.com',
    displayName: null,
    visibility: MessageChannelVisibility.SHARE_EVERYTHING,
    type: MessageChannelType.EMAIL,
    isContactAutoCreationEnabled: true,
    contactAutoCreationPolicy: MessageChannelContactAutoCreationPolicy.SENT,
    messageFolderImportPolicy: MessageFolderImportPolicy.ALL_FOLDERS,
    excludeNonProfessionalEmails: true,
    excludeGroupEmails: true,
    isSyncEnabled: true,
    syncStatus: MessageChannelSyncStatus.ACTIVE,
    syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
    syncStageStartedAt: TIMESTAMP,
    connectedAccountId: MICROSOFT_ACCOUNT_ID,
    connectedAccount: {
      id: MICROSOFT_ACCOUNT_ID,
      handle: 'tim.apple@outlook.com',
    },
    createdAt: TIMESTAMP,
    updatedAt: TIMESTAMP,
  },
];

export const mockedCalendarChannels = [
  {
    __typename: 'CalendarChannel',
    id: '20202020-0000-4000-8000-00000000cal1',
    handle: 'tim@apple.dev',
    visibility: CalendarChannelVisibility.SHARE_EVERYTHING,
    isContactAutoCreationEnabled: true,
    contactAutoCreationPolicy:
      CalendarChannelContactAutoCreationPolicy.AS_PARTICIPANT,
    isSyncEnabled: true,
    syncStatus: CalendarChannelSyncStatus.ACTIVE,
    syncStage: CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
    syncStageStartedAt: TIMESTAMP,
    connectedAccountId: GOOGLE_ACCOUNT_ID,
    createdAt: TIMESTAMP,
    updatedAt: TIMESTAMP,
  },
];

export const mockedApplicationsWithSettingsMenuItems = [
  {
    __typename: 'Application',
    id: CUSTOM_WORKSPACE_APPLICATION_MOCK.id,
    name: 'Stripe',
    logoUrl: null,
    settingsMenuItems: [
      {
        __typename: 'SettingsMenuItem',
        id: APPLICATION_SETTINGS_MENU_ITEM_ID,
        universalIdentifier: '20202020-0000-4000-8000-00000000smu1',
        applicationId: CUSTOM_WORKSPACE_APPLICATION_MOCK.id,
        frontComponentId: APPLICATION_FRONT_COMPONENT_ID,
        title: 'Preferences',
        icon: 'IconAdjustments',
        position: 0,
        scope: SettingsMenuItemScope.USER,
      },
    ],
  },
  {
    __typename: 'Application',
    id: SCROLLER_APPLICATION_ID,
    name: 'LinkedIn scroller',
    logoUrl: null,
    settingsMenuItems: [
      {
        __typename: 'SettingsMenuItem',
        id: SCROLLER_SETTINGS_MENU_ITEM_ID,
        universalIdentifier: '20202020-0000-4000-8000-00000000smu2',
        applicationId: SCROLLER_APPLICATION_ID,
        frontComponentId: APPLICATION_FRONT_COMPONENT_ID,
        title: 'Scrolling preferences',
        icon: 'IconAdjustments',
        position: 0,
        scope: SettingsMenuItemScope.USER,
      },
    ],
  },
];

export const mockedApplicationConnectionProviders = [
  {
    __typename: 'ApplicationConnectionProvider',
    id: APPLICATION_CONNECTION_PROVIDER_ID,
    applicationId: CUSTOM_WORKSPACE_APPLICATION_MOCK.id,
    type: 'oauth',
    name: 'stripe',
    displayName: 'Stripe',
    logoUrl: null,
    oauth: { scopes: ['read'], isClientCredentialsConfigured: true },
  },
  {
    __typename: 'ApplicationConnectionProvider',
    id: SCROLLER_CONNECTION_PROVIDER_ID,
    applicationId: SCROLLER_APPLICATION_ID,
    type: 'oauth',
    name: 'linkedin',
    displayName: 'LinkedIn',
    logoUrl: null,
    oauth: { scopes: ['read'], isClientCredentialsConfigured: true },
  },
];
