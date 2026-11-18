import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { getWorker } from 'msw-storybook-addon';
import { expect, userEvent, within } from 'storybook/test';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import {
  ApplicationConnectionProvidersDocument,
  ConnectionProviderScope,
} from '~/generated-metadata/graphql';
import { clickAndCaptureOAuthRedirect } from '~/pages/settings/accounts/__stories__/clickAndCaptureOAuthRedirect';
import {
  MY_USER_WORKSPACE_ID,
  buildConnectedAccount,
} from '~/pages/settings/accounts/__stories__/mockedAccountGroups';
import {
  GENERATE_TRANSIENT_TOKEN_GRAPHQL_HANDLER,
  MOCKED_TRANSIENT_TOKEN,
} from '~/pages/settings/accounts/__stories__/mockedLinearApplicationPreferences';
import { SettingsAiMcpServerDetail } from '~/pages/settings/ai/SettingsAiMcpServerDetail';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks, metadataGraphql } from '~/testing/graphqlMocks';
import {
  mockedMcpServer,
  mockedMcpServerSignInConnectionProvider,
  mockedMcpServerWithSignIn,
} from '~/testing/mock-data/mcp-servers';
import { mockedWorkspaceMemberData } from '~/testing/mock-data/users';
import { mockedApolloClient } from '~/testing/mockedApolloClient';
import { withinTableRowOrThrow } from '~/testing/utils/withinTableRowOrThrow';

const seedSignedInMember = async () => {
  await mockedApolloClient.clearStore();
  jotaiStore.set(currentWorkspaceMemberState.atom, {
    ...mockedWorkspaceMemberData,
    userWorkspaceId: MY_USER_WORKSPACE_ID,
  });
};

const buildSignInHandlers = ({
  connectionProviderScope = ConnectionProviderScope.USER,
  myConnectedAccounts = [],
}: {
  connectionProviderScope?: ConnectionProviderScope;
  myConnectedAccounts?: ReturnType<typeof buildConnectedAccount>[];
} = {}) => [
  metadataGraphql.query('FindOneMcpServer', () =>
    HttpResponse.json({ data: { mcpServer: mockedMcpServerWithSignIn } }),
  ),
  metadataGraphql.query('ApplicationConnectionProviders', () =>
    HttpResponse.json({
      data: {
        applicationConnectionProviders: [
          {
            ...mockedMcpServerSignInConnectionProvider,
            scope: connectionProviderScope,
          },
        ],
      },
    }),
  ),
  graphql.query('MyConnectedAccounts', () =>
    HttpResponse.json({ data: { myConnectedAccounts } }),
  ),
  graphql.query('MyMessageChannels', () =>
    HttpResponse.json({ data: { myMessageChannels: [] } }),
  ),
  graphql.query('MyCalendarChannels', () =>
    HttpResponse.json({ data: { myCalendarChannels: [] } }),
  ),
  GENERATE_TRANSIENT_TOKEN_GRAPHQL_HANDLER,
  ...graphqlMocks.handlers,
];

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/McpServers/SettingsAiMcpServerDetail',
  component: SettingsAiMcpServerDetail,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/ai/mcp-servers/:mcpServerId',
    routeParams: { ':mcpServerId': mockedMcpServer.id },
  },
  parameters: {
    msw: {
      handlers: [
        metadataGraphql.query('FindOneMcpServer', () =>
          HttpResponse.json({ data: { mcpServer: mockedMcpServer } }),
        ),
        metadataGraphql.mutation('SyncMcpServerTools', () =>
          HttpResponse.json({
            data: {
              syncMcpServerTools: {
                ...mockedMcpServer,
                tools: [
                  ...mockedMcpServer.tools,
                  {
                    __typename: 'McpServerTool',
                    name: 'create_issue',
                    description: 'Create an issue',
                    inputSchema: { type: 'object' },
                    annotations: null,
                  },
                ],
              },
            },
          }),
        ),
        ...graphqlMocks.handlers,
      ],
    },
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsAiMcpServerDetail>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByDisplayValue('https://mcp.linear.app/mcp', undefined, {
      timeout: 3000,
    });

    expect(canvas.getByDisplayValue('linear')).toBeDisabled();
    await canvas.findByText('search_issues');
    await canvas.findByRole('button', { name: 'Deactivate' });
  },
};

export const SyncKeepsUnsavedEdits: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const labelInput = await canvas.findByDisplayValue('Linear', undefined, {
      timeout: 3000,
    });

    await userEvent.clear(labelInput);
    await userEvent.type(labelInput, 'Linear issues');
    await userEvent.click(canvas.getByRole('button', { name: 'Sync tools' }));

    await canvas.findByText('create_issue');
    expect(canvas.getByDisplayValue('Linear issues')).toBeVisible();
  },
};

export const MemberWithoutConnectionStartsTheSignIn: Story = {
  beforeEach: seedSignedInMember,
  parameters: { msw: { handlers: buildSignInHandlers() } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const signInCard = await canvas.findByText(
      'Connect with Linear',
      undefined,
      { timeout: 3000 },
    );

    expect(
      canvas.queryByRole('button', { name: 'Add connection' }),
    ).not.toBeInTheDocument();

    const redirectUrl = await clickAndCaptureOAuthRedirect(signInCard);

    expect(`${redirectUrl.origin}${redirectUrl.pathname}`).toBe(
      `${REACT_APP_SERVER_BASE_URL}/auth/apps/authorize`,
    );
    expect(Object.fromEntries(redirectUrl.searchParams)).toEqual({
      applicationId: mockedMcpServerWithSignIn.applicationId,
      providerName: mockedMcpServerSignInConnectionProvider.name,
      transientToken: MOCKED_TRANSIENT_TOKEN,
      redirectLocation: `/settings/ai/mcp-servers/${mockedMcpServerWithSignIn.id}`,
    });
  },
};

export const SignInShowsWhenTheCachedProvidersPredateTheServer: Story = {
  beforeEach: async () => {
    await seedSignedInMember();
    mockedApolloClient.writeQuery({
      query: ApplicationConnectionProvidersDocument,
      variables: { applicationId: mockedMcpServerWithSignIn.applicationId },
      data: { applicationConnectionProviders: [] },
    });
  },
  parameters: { msw: { handlers: buildSignInHandlers() } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText('Connect with Linear', undefined, {
        timeout: 3000,
      }),
    ).toBeVisible();
  },
};

export const SignedInMemberSeesOnlyTheirConnectionToThisServer: Story = {
  beforeEach: seedSignedInMember,
  parameters: {
    msw: {
      handlers: buildSignInHandlers({
        myConnectedAccounts: [
          buildConnectedAccount({
            id: '20202020-6d63-4070-8000-000000000004',
            handle: 'tim@linear.app',
            provider: 'app',
            userWorkspaceId: MY_USER_WORKSPACE_ID,
            applicationId: mockedMcpServerWithSignIn.applicationId,
            connectionProviderId: mockedMcpServerSignInConnectionProvider.id,
          }),
          buildConnectedAccount({
            id: '20202020-6d63-4070-8000-000000000005',
            handle: 'tim@notion.so',
            provider: 'app',
            userWorkspaceId: MY_USER_WORKSPACE_ID,
            applicationId: mockedMcpServerWithSignIn.applicationId,
            connectionProviderId: '20202020-6d63-4070-8000-000000000006',
          }),
        ],
      }),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('tim@linear.app', undefined, { timeout: 3000 });

    expect(
      withinTableRowOrThrow({
        canvasElement,
        text: 'tim@linear.app',
      }).getByText('Connected'),
    ).toBeVisible();
    expect(
      canvas.getByRole('button', { name: 'Add connection' }),
    ).toBeVisible();
    expect(canvas.queryByText('tim@notion.so')).not.toBeInTheDocument();
    expect(canvas.queryByText('Connect with Linear')).not.toBeInTheDocument();
  },
};

export const SharedSignInShowsNoMemberSection: Story = {
  beforeEach: seedSignedInMember,
  parameters: {
    msw: {
      handlers: buildSignInHandlers({
        connectionProviderScope: ConnectionProviderScope.WORKSPACE,
      }),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('search_issues', undefined, { timeout: 3000 });

    expect(canvas.queryByText('Connect with Linear')).not.toBeInTheDocument();
    expect(
      canvas.queryByText(
        'Connect your own Linear account for this server to use on your behalf.',
      ),
    ).not.toBeInTheDocument();
  },
};

export const SignInLoadErrorOffersRetry: Story = {
  beforeEach: async () => {
    await seedSignedInMember();
    getWorker().use(
      metadataGraphql.query(
        'ApplicationConnectionProviders',
        () =>
          HttpResponse.json({
            errors: [
              {
                message: 'Internal server error',
                extensions: { code: 'INTERNAL_SERVER_ERROR' },
              },
            ],
          }),
        { once: true },
      ),
    );
  },
  parameters: { msw: { handlers: buildSignInHandlers() } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText(
      'Your connections could not be loaded. Check your connection and try again.',
      undefined,
      { timeout: 3000 },
    );

    await userEvent.click(canvas.getByRole('button', { name: 'Retry' }));

    expect(await canvas.findByText('Connect with Linear')).toBeVisible();
  },
};
