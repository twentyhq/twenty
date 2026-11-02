import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, delay, graphql } from 'msw';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';

import { SettingsAccountDetail } from '~/pages/settings/accounts/SettingsAccountDetail';
import {
  ACCOUNT_GROUPS_GRAPHQL_HANDLERS,
  CONNECTED_ACCOUNTS,
  FATHOM_ONLY_ACCOUNT_ID,
  FATHOM_USER_SETTINGS_FRONT_COMPONENT_ID,
  FATHOM_USER_SETTINGS_MENU_ITEM_ID,
  GOOGLE_ACCOUNT_ID,
  GRANOLA_APPLICATION_ID,
  GRANOLA_USER_SETTINGS_MENU_ITEM_ID,
  MY_USER_WORKSPACE_ID,
  USER_SETTINGS_APPLICATION_PREFERENCES_GRAPHQL_HANDLER,
  buildConnectedAccount,
  seedAccountGroupsStory,
} from '~/pages/settings/accounts/__stories__/mockedAccountGroups';
import { GENERATE_TRANSIENT_TOKEN_GRAPHQL_HANDLER } from '~/pages/settings/accounts/__stories__/mockedLinearApplicationPreferences';

const findOneFrontComponent = fn();

const USER_SETTINGS_GRAPHQL_HANDLERS = [
  USER_SETTINGS_APPLICATION_PREFERENCES_GRAPHQL_HANDLER,
  graphql.query('FindOneFrontComponent', ({ variables }) => {
    findOneFrontComponent(variables.id);

    return HttpResponse.json({ data: { frontComponent: null } });
  }),
  GENERATE_TRANSIENT_TOKEN_GRAPHQL_HANDLER,
];

const ARCHIVED_GRANOLA_CONNECTION_GRAPHQL_HANDLER = graphql.query(
  'MyConnectedAccounts',
  () =>
    HttpResponse.json({
      data: {
        myConnectedAccounts: [
          ...CONNECTED_ACCOUNTS,
          buildConnectedAccount({
            id: '20202020-1a2b-4c3d-8e4f-000000000019',
            handle: 'tim@apple.dev',
            provider: 'app',
            userWorkspaceId: MY_USER_WORKSPACE_ID,
            applicationId: GRANOLA_APPLICATION_ID,
            archivedAt: '2026-09-02T00:00:00.000Z',
          }),
        ],
      },
    }),
);

const WITHOUT_CHANNELS_GRAPHQL_HANDLERS = [
  graphql.query('MyMessageChannels', () =>
    HttpResponse.json({ data: { myMessageChannels: [] } }),
  ),
  graphql.query('MyCalendarChannels', () =>
    HttpResponse.json({ data: { myCalendarChannels: [] } }),
  ),
];

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Accounts/SettingsAccountDetail',
  component: SettingsAccountDetail,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/app-preferences/accounts/:connectedAccountId',
    routeParams: { ':connectedAccountId': GOOGLE_ACCOUNT_ID },
    additionalRoutes: ['/settings/app-preferences'],
  },
  beforeEach: seedAccountGroupsStory,
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: ACCOUNT_GROUPS_GRAPHQL_HANDLERS },
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsAccountDetail>;

export const EmailsAndCalendarTabs: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByTestId('tab-emails', undefined, { timeout: 3000 }),
    );

    expect(canvas.getByText('Apps preferences')).toBeVisible();
    expect(await canvas.findByText('Visibility')).toBeVisible();

    await userEvent.click(canvas.getByTestId('tab-calendar'));

    expect(await canvas.findByText('Event visibility')).toBeVisible();
  },
};

export const ConnectedAppSettingsOpenFromTheirTab: Story = {
  beforeEach: () => {
    findOneFrontComponent.mockClear();
  },
  parameters: {
    msw: {
      handlers: [
        ARCHIVED_GRANOLA_CONNECTION_GRAPHQL_HANDLER,
        ...USER_SETTINGS_GRAPHQL_HANDLERS,
        ...ACCOUNT_GROUPS_GRAPHQL_HANDLERS,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const fathomTab = await canvas.findByTestId(
      `tab-${FATHOM_USER_SETTINGS_MENU_ITEM_ID}`,
      undefined,
      { timeout: 3000 },
    );

    expect(fathomTab).toHaveTextContent('Fathom');
    expect(
      canvas.queryByTestId(`tab-${GRANOLA_USER_SETTINGS_MENU_ITEM_ID}`),
    ).not.toBeInTheDocument();

    await userEvent.click(fathomTab);

    await waitFor(
      () =>
        expect(findOneFrontComponent).toHaveBeenCalledWith(
          FATHOM_USER_SETTINGS_FRONT_COMPONENT_ID,
        ),
      { timeout: 3000 },
    );
    expect(findOneFrontComponent).toHaveBeenCalledTimes(1);

    await userEvent.click(canvas.getByTestId('tab-emails'));

    expect(await canvas.findByText('Visibility')).toBeVisible();
  },
};

export const AccountWithoutChannelsShowsItsAppSettings: Story = {
  parameters: {
    msw: {
      handlers: [
        ...WITHOUT_CHANNELS_GRAPHQL_HANDLERS,
        ...USER_SETTINGS_GRAPHQL_HANDLERS,
        ...ACCOUNT_GROUPS_GRAPHQL_HANDLERS,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByTestId(
        `tab-${FATHOM_USER_SETTINGS_MENU_ITEM_ID}`,
        undefined,
        { timeout: 3000 },
      ),
    ).toHaveTextContent('Fathom');
    expect(canvas.queryByTestId('tab-emails')).not.toBeInTheDocument();
    expect(canvas.queryByTestId('tab-calendar')).not.toBeInTheDocument();
  },
};

export const AppOnlyAccountShowsItsAppSettings: Story = {
  args: {
    routeParams: { ':connectedAccountId': FATHOM_ONLY_ACCOUNT_ID },
  },
  parameters: {
    msw: {
      handlers: [
        ...USER_SETTINGS_GRAPHQL_HANDLERS,
        ...ACCOUNT_GROUPS_GRAPHQL_HANDLERS,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByTestId(
        `tab-${FATHOM_USER_SETTINGS_MENU_ITEM_ID}`,
        undefined,
        { timeout: 3000 },
      ),
    ).toHaveTextContent('Fathom');
    expect(canvas.getAllByText('notes@apple.dev').length).toBeGreaterThan(0);
    expect(canvas.queryByTestId('tab-emails')).not.toBeInTheDocument();
  },
};

export const TitleStaysWhileLoading: Story = {
  parameters: {
    msw: {
      handlers: [
        graphql.query('MyConnectedAccounts', async () => {
          await delay('infinite');
        }),
        ...ACCOUNT_GROUPS_GRAPHQL_HANDLERS,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() =>
      expect(canvasElement.querySelector('[aria-busy="true"]')).not.toBeNull(),
    );
    expect(canvas.queryByText('tim@apple.dev')).not.toBeInTheDocument();
    expect(
      canvas.queryByText('Navigated to /settings/app-preferences'),
    ).not.toBeInTheDocument();
  },
};

export const AccountWithoutSettingsGoesBackToAppPreferences: Story = {
  args: {
    routeParams: { ':connectedAccountId': FATHOM_ONLY_ACCOUNT_ID },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText(
        'Navigated to /settings/app-preferences',
        undefined,
        {
          timeout: 3000,
        },
      ),
    ).toBeVisible();
  },
};
