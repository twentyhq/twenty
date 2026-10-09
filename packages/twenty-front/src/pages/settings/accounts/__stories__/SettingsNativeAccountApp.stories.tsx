import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { expect, userEvent, within } from 'storybook/test';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';

import { SettingsNativeAccountApp } from '~/pages/settings/accounts/SettingsNativeAccountApp';
import {
  ACCOUNT_GROUPS_GRAPHQL_HANDLERS,
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
    routeParams: { ':nativeAccountAppId': 'gmail' },
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

export const GmailGeneralShowsAccountsAndBlocklist: Story = {
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
    expect(canvas.getByText('Read emails, Send emails')).toBeVisible();
    expect(canvas.getByText('Read emails')).toBeVisible();
    expect(
      canvas.queryByRole('img', { name: 'Google Calendar' }),
    ).not.toBeInTheDocument();
    expect(canvas.getByTestId('tab-emails')).toBeVisible();
    expect(canvas.queryByTestId('tab-calendar')).not.toBeInTheDocument();
  },
};

export const GmailEmailsTabSwitchesAccount: Story = {
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
