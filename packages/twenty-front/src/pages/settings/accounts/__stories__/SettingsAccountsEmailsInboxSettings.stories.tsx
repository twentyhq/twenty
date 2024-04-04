import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';
import { graphql, HttpResponse } from 'msw';

import { SettingsAccountsEmailsInboxSettings } from '~/pages/settings/accounts/SettingsAccountsEmailsInboxSettings';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Accounts/SettingsAccountsEmailsInboxSettings',
  component: SettingsAccountsEmailsInboxSettings,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/accounts/emails/:accountUuid',
    routeParams: { ':accountUuid': '123' },
  },
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [
        graphql.query('FindOneMessageChannel', () => {
          return HttpResponse.json({
            data: {
              messageChannel: {
                id: '1',
                visibility: 'share_everything',
                messageThreads: { edges: [] },
                createdAt: '2021-08-27T12:00:00Z',
                type: 'email',
                updatedAt: '2021-08-27T12:00:00Z',
                targetUrl: 'https://example.com/webhook',
                connectedAccountId: '1',
                handle: 'handle',
                connectedAccount: {
                  id: '1',
                  handle: 'handle',
                  updatedAt: '2021-08-27T12:00:00Z',
                  accessToken: 'accessToken',
                  messageChannels: { edges: [] },
                  refreshToken: 'refreshToken',
                  __typename: 'ConnectedAccount',
                  accountOwner: { id: '1', __typename: 'WorkspaceMember' },
                  provider: 'provider',
                  createdAt: '2021-08-27T12:00:00Z',
                  accountOwnerId: '1',
                },
                __typename: 'MessageChannel',
              },
            },
          });
        }),
        graphqlMocks.handlers,
      ],
    },
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsAccountsEmailsInboxSettings>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Email visibility');
    await canvas.findByText(
      'Define what will be visible to other users in your workspace',
    );
    await canvas.findByText('Contact auto-creation');
    await canvas.findByText(
      'Automatically create contacts for people you’ve sent emails to',
    );
  },
};
