import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, delay, graphql, http } from 'msw';
import { expect, userEvent, within } from 'storybook/test';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';

import { dispatchMetadataOperationBrowserEvent } from '@/browser-event/utils/dispatchMetadataOperationBrowserEvent';
import { isMicrosoftCalendarEnabledState } from '@/client-config/states/isMicrosoftCalendarEnabledState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { SettingsBuiltInAccountApp } from '~/pages/settings/accounts/SettingsBuiltInAccountApp';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { mockedClientConfig } from '~/testing/mock-data/config';
import { clickAndCaptureOAuthRedirect } from '~/pages/settings/accounts/__stories__/clickAndCaptureOAuthRedirect';
import {
  ACCOUNT_GROUPS_GRAPHQL_HANDLERS,
  CALENDAR_CHANNELS,
  CONNECTED_ACCOUNTS,
  GOOGLE_ACCOUNT_ID,
  GOOGLE_MESSAGE_CHANNEL_ID,
  MESSAGE_CHANNELS,
  MICROSOFT_ACCOUNT_ID,
  seedAccountGroupsStory,
} from '~/pages/settings/accounts/__stories__/mockedAccountGroups';
import { GENERATE_TRANSIENT_TOKEN_GRAPHQL_HANDLER } from '~/pages/settings/accounts/__stories__/mockedLinearApplicationPreferences';
import { withinTableRowOrThrow } from '~/testing/utils/withinTableRowOrThrow';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Accounts/SettingsBuiltInAccountApp',
  component: SettingsBuiltInAccountApp,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/accounts/apps/:builtInAccountAppId',
    routeParams: { ':builtInAccountAppId': 'google' },
    additionalRoutes: ['/settings/accounts'],
  },
  beforeEach: seedAccountGroupsStory,
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: ACCOUNT_GROUPS_GRAPHQL_HANDLERS },
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsBuiltInAccountApp>;

export const GoogleGeneralShowsAccountsAndBlocklist: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByTestId('tab-general', undefined, { timeout: 3000 }),
    );

    expect(await canvas.findByText('Blocklist')).toBeVisible();
    expect(await canvas.findByText('tim@apple.dev')).toBeVisible();
    expect(canvas.getByText('tim.cook@gmail.com')).toBeVisible();
    expect(canvas.queryByText('tim@outlook.com')).not.toBeInTheDocument();
    expect(canvas.queryByText('Used by')).not.toBeInTheDocument();
    expect(canvas.getByText('Permissions')).toBeVisible();
    expect(
      canvas.getByText('Read emails, Send emails, Manage events'),
    ).toBeVisible();
    expect(canvas.getByText('Read emails')).toBeVisible();
    expect(canvas.getByRole('button', { name: 'Add account' })).toBeVisible();
    expect(canvas.getByTestId('tab-emails')).toBeVisible();
    expect(canvas.getByTestId('tab-calendar')).toBeVisible();
  },
};

export const TabBarStaysWhileLoading: Story = {
  parameters: {
    msw: {
      handlers: [
        graphql.query('MyMessageChannels', async () => {
          await delay('infinite');
        }),
        graphql.query('MyCalendarChannels', async () => {
          await delay('infinite');
        }),
        ...ACCOUNT_GROUPS_GRAPHQL_HANDLERS,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText('Shared accounts between apps', undefined, {
        timeout: 3000,
      }),
    ).toBeVisible();
    expect(await canvas.findByTestId('tab-general')).toBeVisible();
    expect(canvas.getByTestId('tab-emails')).toBeVisible();
    expect(canvas.getByTestId('tab-calendar')).toBeVisible();
    expect(canvas.getByText('Blocklist')).toBeVisible();
    expect(canvasElement.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(canvas.queryByText('tim@apple.dev')).not.toBeInTheDocument();
  },
};

export const GoogleEmailsTabSwitchesAccount: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByTestId('tab-emails', undefined, { timeout: 3000 }),
    );

    expect(
      await canvas.findByRole('radio', { name: 'Metadata' }),
    ).not.toBeChecked();

    await userEvent.click(canvas.getByText('tim@apple.dev'));
    await userEvent.click(await body.findByText('tim.cook@gmail.com'));

    expect(await canvas.findByText('tim.cook@gmail.com')).toBeVisible();
    expect(
      await canvas.findByRole('radio', { name: 'Metadata' }),
    ).toBeChecked();
  },
};

export const GoogleCalendarTabShowsCalendarSettings: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByTestId('tab-calendar', undefined, { timeout: 3000 }),
    );

    expect(await canvas.findByText('Event visibility')).toBeVisible();
    expect(canvas.getByText('tim@apple.dev')).toBeVisible();
    expect(canvas.queryByText('tim.cook@gmail.com')).not.toBeInTheDocument();
  },
};

export const OutlookHasEmailsAndCalendarTabs: Story = {
  args: {
    routeParams: { ':builtInAccountAppId': 'outlook' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByTestId('tab-general', undefined, { timeout: 3000 }),
    );

    expect(
      await canvas.findByText('Read emails, Send emails, Manage events'),
    ).toBeVisible();

    await userEvent.click(canvas.getByTestId('tab-emails'));

    expect(await canvas.findByText('Visibility')).toBeVisible();

    await userEvent.click(canvas.getByTestId('tab-calendar'));

    expect(await canvas.findByText('Event visibility')).toBeVisible();
    expect(canvas.getByText('tim@outlook.com')).toBeVisible();
  },
};

export const OutlookWithoutCalendarServiceHasNoCalendarTab: Story = {
  args: {
    routeParams: { ':builtInAccountAppId': 'outlook' },
  },
  parameters: {
    msw: {
      handlers: [
        http.get(`${REACT_APP_SERVER_BASE_URL}/client-config`, () =>
          HttpResponse.json({
            ...mockedClientConfig,
            isMicrosoftCalendarEnabled: false,
          }),
        ),
        ...ACCOUNT_GROUPS_GRAPHQL_HANDLERS,
      ],
    },
  },
  beforeEach: async () => {
    await seedAccountGroupsStory();
    jotaiStore.set(isMicrosoftCalendarEnabledState.atom, false);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByTestId('tab-emails', undefined, { timeout: 3000 }),
    ).toBeVisible();
    expect(canvas.queryByTestId('tab-calendar')).not.toBeInTheDocument();
  },
};

export const CalendarPendingSetupHidesCalendarTab: Story = {
  args: {
    routeParams: { ':builtInAccountAppId': 'outlook' },
  },
  parameters: {
    msw: {
      handlers: [
        graphql.query('MyCalendarChannels', () =>
          HttpResponse.json({
            data: {
              myCalendarChannels: CALENDAR_CHANNELS.map((channel) =>
                channel.connectedAccountId === MICROSOFT_ACCOUNT_ID
                  ? { ...channel, syncStage: 'PENDING_CONFIGURATION' }
                  : channel,
              ),
            },
          }),
        ),
        ...ACCOUNT_GROUPS_GRAPHQL_HANDLERS,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText('tim@outlook.com', undefined, { timeout: 3000 }),
    ).toBeVisible();
    expect(canvas.getByTestId('tab-emails')).toBeVisible();
    expect(canvas.queryByTestId('tab-calendar')).not.toBeInTheDocument();
  },
};

export const DisabledAppGoesBackToAccounts: Story = {
  args: {
    routeParams: { ':builtInAccountAppId': 'imap' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText('Navigated to /settings/accounts', undefined, {
        timeout: 3000,
      }),
    ).toBeVisible();
  },
};

export const OutlookWithoutAccountOffersMicrosoftOnly: Story = {
  args: {
    routeParams: { ':builtInAccountAppId': 'outlook' },
  },
  parameters: {
    msw: {
      handlers: [
        graphql.query('MyConnectedAccounts', () =>
          HttpResponse.json({
            data: {
              myConnectedAccounts: CONNECTED_ACCOUNTS.filter(
                (account) => account.id !== MICROSOFT_ACCOUNT_ID,
              ),
            },
          }),
        ),
        ...ACCOUNT_GROUPS_GRAPHQL_HANDLERS,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText('Connect with Microsoft', undefined, {
        timeout: 3000,
      }),
    ).toBeVisible();
    expect(canvas.queryByText('Connect with Google')).not.toBeInTheDocument();
    expect(canvas.queryByTestId('tab-general')).not.toBeInTheDocument();
    expect(canvas.getByText('Blocklist')).toBeVisible();
  },
};

export const AddAccountStartsTheProviderSignIn: Story = {
  parameters: {
    msw: {
      handlers: [
        GENERATE_TRANSIENT_TOKEN_GRAPHQL_HANDLER,
        ...ACCOUNT_GROUPS_GRAPHQL_HANDLERS,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByTestId('tab-general', undefined, { timeout: 3000 }),
    );

    const redirectUrl = await clickAndCaptureOAuthRedirect(
      await canvas.findByRole('button', { name: 'Add account' }),
    );

    expect(`${redirectUrl.origin}${redirectUrl.pathname}`).toBe(
      `${REACT_APP_SERVER_BASE_URL}/auth/google-apis`,
    );
    expect(redirectUrl.searchParams.has('redirectLocation')).toBe(false);
  },
};

export const ReconnectReturnsToTheAppPage: Story = {
  parameters: {
    msw: {
      handlers: [
        GENERATE_TRANSIENT_TOKEN_GRAPHQL_HANDLER,
        graphql.query('MyConnectedAccounts', () =>
          HttpResponse.json({
            data: {
              myConnectedAccounts: CONNECTED_ACCOUNTS.map((account) =>
                account.id === GOOGLE_ACCOUNT_ID
                  ? { ...account, authFailedAt: '2026-10-01T00:00:00.000Z' }
                  : account,
              ),
            },
          }),
        ),
        ...ACCOUNT_GROUPS_GRAPHQL_HANDLERS,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByTestId('tab-general', undefined, { timeout: 3000 }),
    );
    await canvas.findByText('tim@apple.dev');
    await userEvent.click(
      withinTableRowOrThrow({ canvasElement, text: 'tim@apple.dev' }).getByRole(
        'button',
        { name: 'More options' },
      ),
    );

    const redirectUrl = await clickAndCaptureOAuthRedirect(
      await body.findByRole('menuitem', { name: 'Reconnect' }),
    );

    expect(redirectUrl.searchParams.get('redirectLocation')).toBe(
      '/settings/accounts/apps/google#general',
    );
  },
};

export const ImportingAccountShowsLiveProgress: Story = {
  parameters: {
    msw: {
      handlers: [
        graphql.query('MyMessageChannels', () =>
          HttpResponse.json({
            data: {
              myMessageChannels: MESSAGE_CHANNELS.map((channel) =>
                channel.connectedAccountId === GOOGLE_ACCOUNT_ID
                  ? { ...channel, syncStatus: 'ONGOING', importProgress: 42 }
                  : channel,
              ),
            },
          }),
        ),
        ...ACCOUNT_GROUPS_GRAPHQL_HANDLERS,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByTestId('tab-general', undefined, { timeout: 3000 }),
    );

    expect(await canvas.findByText('Importing 42%')).toBeVisible();

    dispatchMetadataOperationBrowserEvent({
      metadataName: 'messageChannel',
      operation: {
        type: 'update',
        updatedRecord: {
          id: GOOGLE_MESSAGE_CHANNEL_ID,
          syncStatus: 'ONGOING',
          syncStage: 'MESSAGES_IMPORT_ONGOING',
          importProgress: 43,
        },
      },
    });

    expect(await canvas.findByText('Importing 43%')).toBeVisible();
  },
};
