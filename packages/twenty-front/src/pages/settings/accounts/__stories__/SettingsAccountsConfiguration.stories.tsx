import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { expect, userEvent, waitFor, within } from 'storybook/test';

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
    routePath:
      '/settings/app-preferences/accounts/:connectedAccountId/configuration',
    routeParams: { ':connectedAccountId': GOOGLE_ACCOUNT_ID },
    additionalRoutes: ['/settings/app-preferences/google'],
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

    const nextButton = await canvas.findByRole(
      'button',
      { name: 'Next' },
      { timeout: 3000 },
    );

    await waitFor(() => expect(nextButton).toBeEnabled());
    await userEvent.click(nextButton);

    const finishSetupButton = await canvas.findByRole('button', {
      name: 'Finish Setup',
    });

    await waitFor(() => expect(finishSetupButton).toBeEnabled());
    await userEvent.click(finishSetupButton);

    expect(
      await canvas.findByText('Navigated to /settings/app-preferences/google'),
    ).toBeVisible();
  },
};
