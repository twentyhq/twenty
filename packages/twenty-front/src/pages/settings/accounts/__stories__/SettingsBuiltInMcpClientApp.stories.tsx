import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';

import { MCP_SETUP } from '@/settings/mcp/constants/McpSetup';
import { SettingsBuiltInMcpClientApp } from '~/pages/settings/accounts/SettingsBuiltInMcpClientApp';
import { graphqlMocks } from '~/testing/graphqlMocks';

const CLAUDE_AUTHORIZATION_ID = '20202020-6a7b-4c3d-8e4f-0000000000c1';

const CLAUDE_AUTHORIZATION = {
  __typename: 'ApplicationAuthorization',
  id: CLAUDE_AUTHORIZATION_ID,
  applicationId: '20202020-6a7b-4c3d-8e4f-0000000000a1',
  applicationName: 'Claude',
  scopes: ['api', 'profile'],
  redirectUriHostnames: ['claude.ai'],
  lastAuthorizedAt: '2026-10-12T09:00:00.000Z',
  lastUsedAt: '2026-10-12T09:00:00.000Z',
  createdAt: '2026-10-12T09:00:00.000Z',
};

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
                CLAUDE_AUTHORIZATION,
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

export const ClaudeConnectionListsItsActivityAndPermissions: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Connected')).toBeVisible();
    expect(canvas.getByText('Last active')).toBeVisible();
    expect(canvas.getByText('Access your workspace data')).toBeVisible();
    expect(canvas.getByText('Read your profile')).toBeVisible();
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
