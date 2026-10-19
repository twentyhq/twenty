import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, delay, graphql } from 'msw';
import { expect, userEvent, within } from 'storybook/test';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';

import { isMicrosoftCalendarEnabledState } from '@/client-config/states/isMicrosoftCalendarEnabledState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { SettingsNativeAccountApp } from '~/pages/settings/accounts/SettingsNativeAccountApp';
import {
  ACCOUNT_GROUPS_GRAPHQL_HANDLERS,
  CALENDAR_CHANNELS,
  CONNECTED_ACCOUNTS,
  MICROSOFT_ACCOUNT_ID,
  seedAccountGroupsStory,
} from '~/pages/settings/accounts/__stories__/mockedAccountGroups';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Accounts/SettingsNativeAccountApp',
  component: SettingsNativeAccountApp,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/accounts/apps/:nativeAccountAppId',
    routeParams: { ':nativeAccountAppId': 'google' },
    additionalRoutes: ['/settings/accounts'],
  },
  beforeEach: seedAccountGroupsStory,
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: ACCOUNT_GROUPS_GRAPHQL_HANDLERS },
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsNativeAccountApp>;

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
    expect(canvas.getByTestId('tab-emails')).toBeVisible();
    expect(canvas.getByTestId('tab-calendar')).toBeVisible();
  },
};

export const TabBarAndHeadersStayWhileLoading: Story = {
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

    expect(
      await canvas.findByText('Shared accounts between apps', undefined, {
        timeout: 3000,
      }),
    ).toBeVisible();
    expect(canvas.getByTestId('tab-general')).toBeVisible();
    expect(canvas.getByTestId('tab-emails')).toBeVisible();
    expect(canvas.getByTestId('tab-calendar')).toBeVisible();
    expect(canvas.getByText('Blocklist')).toBeVisible();
    expect(canvas.getByText('Permissions')).toBeVisible();
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
    routeParams: { ':nativeAccountAppId': 'outlook' },
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
    routeParams: { ':nativeAccountAppId': 'outlook' },
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
    routeParams: { ':nativeAccountAppId': 'outlook' },
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
    routeParams: { ':nativeAccountAppId': 'imap' },
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
    routeParams: { ':nativeAccountAppId': 'outlook' },
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
    expect(canvas.getByText('Blocklist')).toBeVisible();
  },
};
