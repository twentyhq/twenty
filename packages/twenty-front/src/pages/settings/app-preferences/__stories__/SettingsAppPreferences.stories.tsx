import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, delay } from 'msw';
import { within } from 'storybook/test';
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
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks, metadataGraphql } from '~/testing/graphqlMocks';

import { SettingsAppPreferences } from '~/pages/settings/app-preferences/SettingsAppPreferences';

const GOOGLE_ACCOUNT_ID = '20202020-0000-4000-8000-00000000acc1';
const MICROSOFT_ACCOUNT_ID = '20202020-0000-4000-8000-00000000acc2';
const APPLICATION_ACCOUNT_ID = '20202020-0000-4000-8000-00000000acc3';
const APPLICATION_CONNECTION_PROVIDER_ID =
  '20202020-0000-4000-8000-00000000prv1';
const APPLICATION_FRONT_COMPONENT_ID = '20202020-0000-4000-8000-00000000frc1';
const APPLICATION_SETTINGS_MENU_ITEM_ID =
  '20202020-0000-4000-8000-00000000smi1';
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

const mockedConnectedAccounts = [
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

const mockedMessageChannels = [
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
];

const mockedCalendarChannels = [
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

const mockedApplicationsWithSettingsMenuItems = [
  {
    __typename: 'Application',
    id: CUSTOM_WORKSPACE_APPLICATION_MOCK.id,
    name: CUSTOM_WORKSPACE_APPLICATION_MOCK.name,
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
];

const mockedApplicationConnectionProviders = [
  {
    __typename: 'ApplicationConnectionProvider',
    id: APPLICATION_CONNECTION_PROVIDER_ID,
    applicationId: CUSTOM_WORKSPACE_APPLICATION_MOCK.id,
    type: 'oauth',
    name: 'custom',
    displayName: 'Custom',
    logoUrl: null,
    oauth: { scopes: ['read'], isClientCredentialsConfigured: true },
  },
];

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/AppPreferences/SettingsAppPreferences',
  component: SettingsAppPreferences,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/accounts',
  },
  parameters: {
    layout: 'fullscreen',
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsAppPreferences>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Connected accounts', undefined, {
      timeout: 3000,
    });
  },
};

export const WithAccountsAndAppPreferences: Story = {
  parameters: {
    msw: {
      handlers: [
        metadataGraphql.query('MyConnectedAccounts', () =>
          HttpResponse.json({
            data: { myConnectedAccounts: mockedConnectedAccounts },
          }),
        ),
        metadataGraphql.query('MyMessageChannels', () =>
          HttpResponse.json({
            data: { myMessageChannels: mockedMessageChannels },
          }),
        ),
        metadataGraphql.query('MyCalendarChannels', () =>
          HttpResponse.json({
            data: { myCalendarChannels: mockedCalendarChannels },
          }),
        ),
        metadataGraphql.query('FindManyApplicationsWithSettingsMenuItems', () =>
          HttpResponse.json({
            data: {
              findManyApplications: mockedApplicationsWithSettingsMenuItems,
            },
          }),
        ),
        metadataGraphql.query('ApplicationConnectionProviders', () =>
          HttpResponse.json({
            data: {
              applicationConnectionProviders:
                mockedApplicationConnectionProviders,
            },
          }),
        ),
        // The front component itself is served by a running app; keep it
        // loading so the section shows its skeleton rather than an error.
        metadataGraphql.query('FindOneFrontComponent', async () => {
          await delay('infinite');
        }),
        ...graphqlMocks.handlers,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('tim.apple@outlook.com', undefined, {
      timeout: 3000,
    });
    await canvas.findByText('Preferences', undefined, { timeout: 3000 });
  },
};
