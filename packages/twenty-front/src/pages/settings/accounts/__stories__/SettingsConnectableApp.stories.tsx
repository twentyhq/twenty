import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { getWorker } from 'msw-storybook-addon';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';

import {
  CHATGPT_CONNECTABLE_APP,
  CLAUDE_CONNECTABLE_APP,
} from '@/settings/app-preferences/testing/connectableAppFixtures';
import { SettingsAppPreferencesApp } from '~/pages/settings/accounts/SettingsAppPreferencesApp';
import { SettingsConnectableApp } from '~/pages/settings/accounts/SettingsConnectableApp';
import { removeConnectedAccountsPermission } from '~/pages/settings/accounts/__stories__/mockedAccountGroups';
import { graphqlMocks } from '~/testing/graphqlMocks';

const CLAUDE_AUTHORIZATION_ID = '20202020-6a7b-4c3d-8e4f-0000000000c1';

const buildClaudeAuthorization = ({
  id = CLAUDE_AUTHORIZATION_ID,
  lastUsedHoursAgo = 2,
  scopes = ['api', 'profile'],
}: { id?: string; lastUsedHoursAgo?: number; scopes?: string[] } = {}) => ({
  __typename: 'ApplicationAuthorization',
  id,
  scopes,
  oAuthIdentityUniversalIdentifier: CLAUDE_CONNECTABLE_APP.id,
  lastUsedAt: new Date(
    Date.now() - lastUsedHoursAgo * 60 * 60 * 1000,
  ).toISOString(),
});

const revokedAuthorizationIds = new Set<string>();

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Accounts/SettingsConnectableApp',
  component: SettingsConnectableApp,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/app-preferences/:applicationId',
    routeParams: { ':applicationId': CLAUDE_CONNECTABLE_APP.id },
    additionalRoutes: ['/settings/app-preferences'],
  },
  beforeEach: () => {
    revokedAuthorizationIds.clear();
  },
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [
        graphql.query('FindManyMarketplaceApps', () =>
          HttpResponse.json({
            data: {
              findManyMarketplaceApps: [
                CHATGPT_CONNECTABLE_APP,
                CLAUDE_CONNECTABLE_APP,
              ].map((connectableApp) => ({
                __typename: 'MarketplaceApp',
                author: '',
                category: 'Productivity',
                sourcePackage: null,
                isListed: true,
                ...connectableApp,
              })),
            },
          }),
        ),
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

export type Story = StoryObj<typeof SettingsConnectableApp>;

export const ChatGptWithoutConnectionOffersToConnect: Story = {
  args: {
    routeParams: { ':applicationId': CHATGPT_CONNECTABLE_APP.id },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByRole('link', { name: /Connect with ChatGPT/ }),
    ).toHaveAttribute('href', CHATGPT_CONNECTABLE_APP.connectUrl);
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

const EARLIER_CLAUDE_AUTHORIZATION_ID = '20202020-6a7b-4c3d-8e4f-0000000000c2';

export const ClaudeEarlierConnectionShowsAndDisconnectsAsOne: Story = {
  beforeEach: () => {
    getWorker().use(
      graphql.query('CurrentUserApplicationAuthorizations', () =>
        HttpResponse.json({
          data: {
            currentUserApplicationAuthorizations: [
              buildClaudeAuthorization({ scopes: ['profile'] }),
              buildClaudeAuthorization({
                id: EARLIER_CLAUDE_AUTHORIZATION_ID,
                lastUsedHoursAgo: 72,
              }),
            ].filter(({ id }) => !revokedAuthorizationIds.has(id)),
          },
        }),
      ),
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    expect(
      await canvas.findByText('Read your profile, Access your workspace data'),
    ).toBeVisible();
    expect(canvas.getByText('Last used 2h')).toBeVisible();
    expect(canvas.queryByText('Last used 3d')).not.toBeInTheDocument();
    expect(
      canvas.queryByRole('button', { name: 'Add connection' }),
    ).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'More options' }));
    await userEvent.click(await body.findByText('Disconnect'));
    await userEvent.click(body.getByRole('button', { name: 'Disconnect' }));

    await waitFor(() =>
      expect([...revokedAuthorizationIds].sort()).toEqual(
        [CLAUDE_AUTHORIZATION_ID, EARLIER_CLAUDE_AUTHORIZATION_ID].sort(),
      ),
    );
    expect(await canvas.findByText('Connect with Claude')).toBeVisible();
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
