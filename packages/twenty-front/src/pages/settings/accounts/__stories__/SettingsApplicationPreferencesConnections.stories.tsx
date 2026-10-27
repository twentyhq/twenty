import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';

import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { SettingsApplicationPreferences } from '~/pages/settings/accounts/SettingsApplicationPreferences';
import { deleteConnectedAccount } from '~/pages/settings/accounts/__stories__/mockedAccountGroups';
import {
  APPLICATION_PREFERENCES_DETAIL_GRAPHQL_HANDLERS,
  APPLICATION_PREFERENCES_GRAPHQL_HANDLERS,
  failNextConnectedAccountsRequest,
  findApplicationsGatedQuery,
  seedApplicationPreferencesStory,
} from '~/pages/settings/accounts/__stories__/mockedApplicationPreferences';
import {
  LINEAR_APPLICATION_ID,
  LINEAR_CONNECTIONS_REDIRECT_LOCATION,
  LINEAR_RECONNECT_NEEDED_ACCOUNT_ID,
  MOCKED_TRANSIENT_TOKEN,
  generateTransientToken,
  unconfigureLinearClientCredentials,
} from '~/pages/settings/accounts/__stories__/mockedLinearApplicationPreferences';
import { clickAndCaptureOAuthRedirect } from '~/pages/settings/accounts/__stories__/clickAndCaptureOAuthRedirect';
import { withinTableRowOrThrow } from '~/testing/utils/withinTableRowOrThrow';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Accounts/SettingsApplicationPreferencesConnections',
  component: SettingsApplicationPreferences,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/accounts/applications/:applicationId',
    routeParams: { ':applicationId': LINEAR_APPLICATION_ID },
    additionalRoutes: ['/settings/accounts'],
  },
  beforeEach: seedApplicationPreferencesStory,
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: APPLICATION_PREFERENCES_DETAIL_GRAPHQL_HANDLERS },
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsApplicationPreferences>;

export const ConnectionOnlyAppListsMyConnections: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    expect(
      await canvas.findByRole(
        'link',
        { name: 'Connections' },
        { timeout: 3000 },
      ),
    ).toBeVisible();
    expect(
      canvas.queryByRole('link', { name: 'Variables' }),
    ).not.toBeInTheDocument();

    expect(await canvas.findByText('Work Linear')).toBeVisible();
    expect(
      withinTableRowOrThrow({ canvasElement, text: 'Work Linear' }).getByText(
        'tim@linear.app',
      ),
    ).toBeVisible();
    expect(
      withinTableRowOrThrow({ canvasElement, text: 'Work Linear' }).getByText(
        'Connected',
      ),
    ).toBeVisible();

    const reconnectNeededRow = withinTableRowOrThrow({
      canvasElement,
      text: 'tim.cook@linear.app',
    });

    expect(reconnectNeededRow.getByText('Reconnect needed')).toBeVisible();

    const archivedRow = withinTableRowOrThrow({
      canvasElement,
      text: 'old@linear.app',
    });

    expect(archivedRow.getByText('Disconnected')).toBeVisible();

    const archivedAfterFailureRow = withinTableRowOrThrow({
      canvasElement,
      text: 'left@linear.app',
    });

    expect(archivedAfterFailureRow.getByText('Disconnected')).toBeVisible();

    for (const { text, canReconnect } of [
      { text: 'Work Linear', canReconnect: false },
      { text: 'tim.cook@linear.app', canReconnect: true },
      { text: 'old@linear.app', canReconnect: false },
      { text: 'left@linear.app', canReconnect: false },
    ]) {
      await userEvent.click(
        withinTableRowOrThrow({ canvasElement, text }).getByRole('button', {
          name: 'More options',
        }),
      );

      expect(
        await body.findByRole('menuitem', { name: 'Remove' }),
      ).toBeVisible();

      if (canReconnect) {
        expect(body.getByRole('menuitem', { name: 'Reconnect' })).toBeVisible();
      } else {
        expect(
          body.queryByRole('menuitem', { name: 'Reconnect' }),
        ).not.toBeInTheDocument();
      }

      await userEvent.keyboard('{Escape}');
      await waitFor(() =>
        expect(body.queryByRole('menu')).not.toBeInTheDocument(),
      );
    }

    expect(canvas.queryByText('teammate@linear.app')).not.toBeInTheDocument();
    expect(findApplicationsGatedQuery).not.toHaveBeenCalled();
  },
};

export const AddConnectionStartsTheOAuthFlow: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const redirectUrl = await clickAndCaptureOAuthRedirect(
      await canvas.findByRole(
        'button',
        { name: 'Add connection' },
        { timeout: 3000 },
      ),
    );

    expect(generateTransientToken).toHaveBeenCalledTimes(1);
    expect(`${redirectUrl.origin}${redirectUrl.pathname}`).toBe(
      `${REACT_APP_SERVER_BASE_URL}/auth/apps/authorize`,
    );
    expect(Object.fromEntries(redirectUrl.searchParams)).toEqual({
      applicationId: LINEAR_APPLICATION_ID,
      providerName: 'linear',
      transientToken: MOCKED_TRANSIENT_TOKEN,
      redirectLocation: LINEAR_CONNECTIONS_REDIRECT_LOCATION,
    });
  },
};

export const ReconnectStartsTheOAuthFlow: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await canvas.findByText('tim.cook@linear.app', undefined, {
      timeout: 3000,
    });

    await userEvent.click(
      withinTableRowOrThrow({
        canvasElement,
        text: 'tim.cook@linear.app',
      }).getByRole('button', { name: 'More options' }),
    );

    const redirectUrl = await clickAndCaptureOAuthRedirect(
      await body.findByRole('menuitem', { name: 'Reconnect' }),
    );

    expect(generateTransientToken).toHaveBeenCalledTimes(1);
    expect(`${redirectUrl.origin}${redirectUrl.pathname}`).toBe(
      `${REACT_APP_SERVER_BASE_URL}/auth/apps/authorize`,
    );
    expect(Object.fromEntries(redirectUrl.searchParams)).toEqual({
      applicationId: LINEAR_APPLICATION_ID,
      providerName: 'linear',
      transientToken: MOCKED_TRANSIENT_TOKEN,
      reconnectingConnectedAccountId: LINEAR_RECONNECT_NEEDED_ACCOUNT_ID,
      redirectLocation: LINEAR_CONNECTIONS_REDIRECT_LOCATION,
    });
  },
};

export const RowRemoveDeletesTheConnection: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await canvas.findByText('tim.cook@linear.app', undefined, {
      timeout: 3000,
    });

    await userEvent.click(
      withinTableRowOrThrow({
        canvasElement,
        text: 'tim.cook@linear.app',
      }).getByRole('button', { name: 'More options' }),
    );
    await userEvent.click(
      await body.findByRole('menuitem', { name: 'Remove' }),
    );
    await userEvent.click(
      await within(
        await body.findByRole('dialog', { name: 'Remove connection?' }),
      ).findByRole('button', { name: 'Remove' }),
    );

    await waitFor(() =>
      expect(deleteConnectedAccount.mock.calls).toEqual([
        [LINEAR_RECONNECT_NEEDED_ACCOUNT_ID],
      ]),
    );
    await waitFor(() =>
      expect(canvas.queryByText('tim.cook@linear.app')).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(
        body.queryByRole('dialog', { name: 'Remove connection?' }),
      ).not.toBeInTheDocument(),
    );
    expect(canvas.getByText('Work Linear')).toBeVisible();
  },
};

export const UnconfiguredProviderExplainsWhoMustSetItUp: Story = {
  beforeEach: async () => {
    await seedApplicationPreferencesStory();
    unconfigureLinearClientCredentials();
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    expect(
      await canvas.findByText(
        'Linear OAuth is not yet set up by your server administrator. They need to fill in the OAuth client ID and secret on the application registration before you can add a connection.',
        undefined,
        { timeout: 3000 },
      ),
    ).toBeVisible();
    expect(
      canvas.queryByRole('button', { name: 'Add connection' }),
    ).not.toBeInTheDocument();
    await canvas.findByText('tim.cook@linear.app', undefined, {
      timeout: 3000,
    });
    expect(
      withinTableRowOrThrow({
        canvasElement,
        text: 'tim.cook@linear.app',
      }).getByText('Reconnect needed'),
    ).toBeVisible();
    await userEvent.click(
      withinTableRowOrThrow({
        canvasElement,
        text: 'tim.cook@linear.app',
      }).getByRole('button', { name: 'More options' }),
    );
    expect(await body.findByRole('menuitem', { name: 'Remove' })).toBeVisible();
    expect(
      body.queryByRole('menuitem', { name: 'Reconnect' }),
    ).not.toBeInTheDocument();
  },
};

export const ProviderWithoutConnectionsSaysSo: Story = {
  parameters: {
    msw: { handlers: APPLICATION_PREFERENCES_GRAPHQL_HANDLERS },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText('You have no Linear connection yet.', undefined, {
        timeout: 3000,
      }),
    ).toBeVisible();
    expect(
      canvas.getByRole('button', { name: 'Add connection' }),
    ).toBeVisible();
  },
};

export const UnconfiguredProviderWithoutConnectionsShowsOnlyTheBanner: Story = {
  beforeEach: async () => {
    await seedApplicationPreferencesStory();
    unconfigureLinearClientCredentials();
  },
  parameters: {
    msw: { handlers: APPLICATION_PREFERENCES_GRAPHQL_HANDLERS },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText(/Linear OAuth is not yet set up/, undefined, {
        timeout: 3000,
      }),
    ).toBeVisible();
    expect(
      canvas.queryByText('You have no Linear connection yet.'),
    ).not.toBeInTheDocument();
  },
};

export const LoadErrorOffersRetryInsteadOfTheEmptyState: Story = {
  beforeEach: async () => {
    await seedApplicationPreferencesStory();
    failNextConnectedAccountsRequest();
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText(
        'Your connections could not be loaded. Check your connection and try again.',
        undefined,
        { timeout: 3000 },
      ),
    ).toBeVisible();
    expect(
      canvas.queryByText('You have no Linear connection yet.'),
    ).not.toBeInTheDocument();
    expect(
      canvas.queryByRole('button', { name: 'Add connection' }),
    ).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Retry' }));

    expect(
      await canvas.findByText('Work Linear', undefined, { timeout: 3000 }),
    ).toBeVisible();
    expect(
      canvas.getByRole('button', { name: 'Add connection' }),
    ).toBeVisible();
    expect(
      canvas.queryByText(
        'Your connections could not be loaded. Check your connection and try again.',
      ),
    ).not.toBeInTheDocument();
  },
};
