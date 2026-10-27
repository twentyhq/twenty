import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { expect, userEvent, within } from 'storybook/test';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';

import { SettingsAccountsConfiguration } from '~/pages/settings/accounts/SettingsAccountsConfiguration';
import {
  ACCOUNT_GROUPS_GRAPHQL_HANDLERS,
  GOOGLE_ACCOUNT_ID,
  seedAccountGroupsStory,
} from '~/pages/settings/accounts/__stories__/mockedAccountGroups';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Accounts/SettingsAccountsConfiguration',
  component: SettingsAccountsConfiguration,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/accounts/configuration/:connectedAccountId',
    routeParams: { ':connectedAccountId': GOOGLE_ACCOUNT_ID },
    additionalRoutes: ['/settings/accounts/apps/google'],
  },
  beforeEach: seedAccountGroupsStory,
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [
        graphql.mutation('StartChannelSync', () =>
          HttpResponse.json({
            data: {
              startChannelSync: {
                __typename: 'ChannelSyncSuccess',
                success: true,
              },
            },
          }),
        ),
        ...ACCOUNT_GROUPS_GRAPHQL_HANDLERS,
      ],
    },
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsAccountsConfiguration>;

export const FinishedSetupOpensTheAppPage: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Next' }, { timeout: 3000 }),
    );
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Finish Setup' }),
    );

    expect(
      await canvas.findByText('Navigated to /settings/accounts/apps/google'),
    ).toBeVisible();
  },
};
