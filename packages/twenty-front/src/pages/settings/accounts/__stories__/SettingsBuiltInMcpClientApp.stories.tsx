import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { getWorker } from 'msw-storybook-addon';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';

import { MCP_SETUP } from '@/settings/mcp/constants/McpSetup';
import { SettingsAppPreferencesApp } from '~/pages/settings/accounts/SettingsAppPreferencesApp';
import { SettingsBuiltInMcpClientApp } from '~/pages/settings/accounts/SettingsBuiltInMcpClientApp';
import { removeConnectedAccountsPermission } from '~/pages/settings/accounts/__stories__/mockedAccountGroups';
import { WellKnownOAuthClient } from '~/generated-metadata/graphql';
import { graphqlMocks } from '~/testing/graphqlMocks';

const CLAUDE_AUTHORIZATION_ID = '20202020-6a7b-4c3d-8e4f-0000000000c1';

// The mock-date decorator fakes Date only at render, after this module loads
const buildClaudeAuthorization = ({
  id = CLAUDE_AUTHORIZATION_ID,
  lastUsedHoursAgo = 2,
}: { id?: string; lastUsedHoursAgo?: number } = {}) => ({
  __typename: 'ApplicationAuthorization',
  id,
  applicationId: '20202020-6a7b-4c3d-8e4f-0000000000a1',
  applicationName: 'Claude',
  scopes: ['api', 'profile'],
  wellKnownOAuthClient: WellKnownOAuthClient.CLAUDE,
  lastAuthorizedAt: '2026-10-12T09:00:00.000Z',
  lastUsedAt: new Date(
    Date.now() - lastUsedHoursAgo * 60 * 60 * 1000,
  ).toISOString(),
  createdAt: '2026-10-12T09:00:00.000Z',
});

const revokedAuthorizationIds = new Set<string>();

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Accounts/SettingsBuiltInMcpClientApp',
  component: SettingsBuiltInMcpClientApp,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/app-preferences/:applicationId',
    routeParams: { ':applicationId': 'claude' },
    additionalRoutes: ['/settings/app-preferences'],
  },
  beforeEach: () => {
    revokedAuthorizationIds.clear();
  },
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [
        graphql.query('CurrentUserApplicationAuthorizations', () =>
          HttpResponse.json({
            data: {
              currentUserApplicationAuthorizations: [
                buildClaudeAuthorization(),
              ].filter(({ id }) => !revokedAuthorizationIds.has(id)),
            },
          }),
        ),
        graphql.mutation('RevokeApplicationAuthorization', ({ variables }) => {
          revokedAuthorizationIds.add(variables.applicationAuthorizationId);

          return HttpResponse.json({
            data: { revokeApplicationAuthorization: true },
          });
        }),
        ...graphqlMocks.handlers,
      ],
    },
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsBuiltInMcpClientApp>;

export const ChatGptWithoutConnectionOffersToConnect: Story = {
  args: {
    routeParams: { ':applicationId': 'chatgpt' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByRole('link', { name: /Connect with ChatGPT/ }),
    ).toHaveAttribute('href', MCP_SETUP.chatGptTwentyAppUrl);
    expect(canvas.queryByText('Permissions')).not.toBeInTheDocument();
  },
};

export const ClaudeConnectionListsItsPermissions: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Connected')).toBeVisible();
    expect(canvas.getByText('Last used 2h')).toBeVisible();
    expect(canvas.getByText('Permissions')).toBeVisible();
    expect(
      canvas.getByText('Access your workspace data, Read your profile'),
    ).toBeVisible();
  },
};

export const ClaudeConnectionsShowWhenEachWasLastUsed: Story = {
  beforeEach: () => {
    getWorker().use(
      graphql.query('CurrentUserApplicationAuthorizations', () =>
        HttpResponse.json({
          data: {
            currentUserApplicationAuthorizations: [
              buildClaudeAuthorization(),
              buildClaudeAuthorization({
                id: '20202020-6a7b-4c3d-8e4f-0000000000c2',
                lastUsedHoursAgo: 72,
              }),
            ],
          },
        }),
      ),
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Last used 3d')).toBeVisible();
    expect(canvas.getByText('Last used 2h')).toBeVisible();
  },
};

export const ClaudeDisconnectRevokesTheConnection: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'More options' }),
    );
    await userEvent.click(await body.findByText('Disconnect'));
    expect(await body.findByText('Disconnect Claude?')).toBeVisible();
    await userEvent.click(body.getByRole('button', { name: 'Disconnect' }));

    await waitFor(() =>
      expect(revokedAuthorizationIds.has(CLAUDE_AUTHORIZATION_ID)).toBe(true),
    );
    expect(await canvas.findByText('Connect with Claude')).toBeVisible();
  },
};

export const ClaudeOpensWithoutConnectedAccountsPermission: Story = {
  render: () => <SettingsAppPreferencesApp />,
  beforeEach: removeConnectedAccountsPermission,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Connected')).toBeVisible();
    expect(canvas.getByText('Last used 2h')).toBeVisible();
  },
};
