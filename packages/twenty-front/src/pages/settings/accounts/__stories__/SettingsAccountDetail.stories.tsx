import { type Meta, type StoryObj } from '@storybook/react-vite';
import { delay, graphql } from 'msw';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';

import { SettingsAccountDetail } from '~/pages/settings/accounts/SettingsAccountDetail';
import {
  ACCOUNT_GROUPS_GRAPHQL_HANDLERS,
  FATHOM_ONLY_ACCOUNT_ID,
  GOOGLE_ACCOUNT_ID,
  seedAccountGroupsStory,
} from '~/pages/settings/accounts/__stories__/mockedAccountGroups';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Accounts/SettingsAccountDetail',
  component: SettingsAccountDetail,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/accounts/detail/:connectedAccountId',
    routeParams: { ':connectedAccountId': GOOGLE_ACCOUNT_ID },
    additionalRoutes: ['/settings/accounts'],
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

    expect(canvas.getByText('App preferences')).toBeVisible();
    expect(await canvas.findByText('Visibility')).toBeVisible();

    await userEvent.click(canvas.getByTestId('tab-calendar'));

    expect(await canvas.findByText('Event visibility')).toBeVisible();
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
      canvas.queryByText('Navigated to /settings/accounts'),
    ).not.toBeInTheDocument();
  },
};

export const AccountWithoutSettingsGoesBackToAccounts: Story = {
  args: {
    routeParams: { ':connectedAccountId': FATHOM_ONLY_ACCOUNT_ID },
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
