import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { expect, within } from 'storybook/test';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedApolloClient } from '~/testing/mockedApolloClient';

import { SettingsApplicationConnectionDetail } from '~/pages/settings/applications/SettingsApplicationConnectionDetail';

const APPLICATION_ID = '20202020-6a7b-4c3d-8e4f-000000000021';
const CONNECTION_PROVIDER_ID = '20202020-6a7b-4c3d-8e4f-000000000022';
const CONNECTED_ACCOUNT_ID = '20202020-6a7b-4c3d-8e4f-000000000023';

const GRANTED_SCOPES = [
  'https://graph.microsoft.com/OnlineMeetings.Read',
  'https://graph.microsoft.com/OnlineMeetingTranscript.Read.All',
  'https://graph.microsoft.com/OnlineMeetingRecording.Read.All',
  'https://graph.microsoft.com/Calendars.Read',
  'https://graph.microsoft.com/User.Read',
  'offline_access',
];

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Applications/SettingsApplicationConnectionDetail',
  component: SettingsApplicationConnectionDetail,
  decorators: [PageDecorator],
  args: {
    routePath:
      '/settings/applications/:applicationId/connections/:connectedAccountId',
    routeParams: {
      ':applicationId': APPLICATION_ID,
      ':connectedAccountId': CONNECTED_ACCOUNT_ID,
    },
  },
  beforeEach: async () => {
    await mockedApolloClient.clearStore();
  },
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [
        graphql.query('FindOneApplication', () =>
          HttpResponse.json({
            data: {
              findOneApplication: {
                __typename: 'Application',
                id: APPLICATION_ID,
                name: 'Microsoft Teams',
                description: 'Imports meeting transcripts',
                logoUrl: null,
                version: '1.0.0',
                universalIdentifier: APPLICATION_ID,
                applicationRegistrationId: null,
                applicationRegistration: null,
                canBeUninstalled: true,
                isUninstallBlockedByOtherWorkspaceInstallations: false,
                autoUpgrade: false,
                defaultRoleId: null,
                settingsCustomTabFrontComponentId: null,
                healthCheckLogicFunctionId: null,
                availablePackages: {},
                requestedIframeMediaPermissions: [],
                grantedIframeMediaPermissions: [],
                applicationVariables: [],
                agents: [],
                frontComponents: [],
                commandMenuItems: [],
                settingsMenuItems: [],
                objects: [],
                logicFunctions: [],
              },
            },
          }),
        ),
        graphql.query('ApplicationConnectionProviders', () =>
          HttpResponse.json({
            data: {
              applicationConnectionProviders: [
                {
                  __typename: 'ApplicationConnectionProvider',
                  id: CONNECTION_PROVIDER_ID,
                  applicationId: APPLICATION_ID,
                  type: 'oauth',
                  name: 'microsoft-teams',
                  displayName: 'Microsoft Teams',
                  scope: 'WORKSPACE',
                  logoUrl: null,
                  oauth: {
                    __typename: 'ApplicationConnectionProviderOAuthConfig',
                    scopes: GRANTED_SCOPES,
                    isClientCredentialsConfigured: true,
                  },
                },
              ],
            },
          }),
        ),
        graphql.query('ApplicationConnectedAccounts', () =>
          HttpResponse.json({
            data: {
              applicationConnectedAccounts: [
                {
                  __typename: 'ApplicationConnectedAccountDTO',
                  id: CONNECTED_ACCOUNT_ID,
                  handle: 'workspace@example.com',
                  authFailedAt: null,
                  authFailedReason: null,
                  archivedAt: null,
                  scopes: GRANTED_SCOPES,
                  lastSignedInAt: null,
                  connectionProviderId: CONNECTION_PROVIDER_ID,
                  name: 'Microsoft Teams #2',
                  scope: 'WORKSPACE',
                  lastCredentialsRefreshedAt: '2026-11-13T12:03:30.000Z',
                  createdAt: '2026-11-13T12:03:30.000Z',
                  updatedAt: '2026-11-13T12:03:30.000Z',
                },
              ],
            },
          }),
        ),
        graphql.query('MyMessageChannels', () =>
          HttpResponse.json({ data: { myMessageChannels: [] } }),
        ),
        ...graphqlMocks.handlers,
      ],
    },
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsApplicationConnectionDetail>;

export const WrappedScopesStayInsideTheirRow: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const lastScopeTag = await canvas.findByText(
      GRANTED_SCOPES[GRANTED_SCOPES.length - 1],
      undefined,
      { timeout: 3000 },
    );
    const scopesRow = lastScopeTag.closest('[data-table-row]');

    expect(scopesRow).not.toBeNull();
    expect(lastScopeTag.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      scopesRow?.getBoundingClientRect().bottom ?? 0,
    );
  },
};
