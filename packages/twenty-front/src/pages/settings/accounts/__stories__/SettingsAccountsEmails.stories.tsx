import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { SettingsAccountsEmails } from '~/pages/settings/accounts/SettingsAccountsEmails';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Accounts/SettingsAccountsEmails',
  component: SettingsAccountsEmails,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/accounts/emails',
  },
  parameters: {
    layout: 'fullscreen',
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsAccountsEmails>;

export const NoConnectedAccount: Story = {};

export const TwoConnectedAccounts: Story = {
  parameters: {
    msw: {
      handlers: [
        ...graphqlMocks.handlers,
        graphql.query('MyConnectedAccounts', () => {
          return HttpResponse.json({
            data: {
              myConnectedAccounts: [
                {
                  id: '20202020-954c-4d76-9a87-e5f072d4b7ef',
                  handle: 'test.test@gmail.com',
                  provider: 'google',
                  authFailedAt: null,
                  scopes: ['email'],
                  handleAliases: '',
                  lastSignedInAt: null,
                  userWorkspaceId: '20202020-03f2-4d83-b0d5-2ec2bcee72d4',
                  connectionProviderId: null,
                  name: 'Test User',
                  visibility: 'SHARE_EVERYTHING',
                  lastCredentialsRefreshedAt: null,
                  connectionParameters: null,
                  createdAt: '2024-07-03T20:03:35.064Z',
                  updatedAt: '2024-07-03T20:03:35.064Z',
                },
              ],
            },
          });
        }),
        graphql.query('MyMessageChannels', () => {
          return HttpResponse.json({
            data: {
              myMessageChannels: [
                {
                  id: '20202020-ef5a-4822-9e08-ce6e6a4dcb6f',
                  handle: 'test.test@gmail.com',
                  connectedAccountId: '20202020-954c-4d76-9a87-e5f072d4b7ef',
                  type: 'email',
                  isSyncEnabled: true,
                  syncStage: 'MESSAGE_LIST_FETCH_PENDING',
                  syncStatus: 'COMPLETED',
                  visibility: 'SHARE_EVERYTHING',
                  contactAutoCreationPolicy: 'SENT',
                  isContactAutoCreationEnabled: true,
                  excludeNonProfessionalEmails: true,
                  excludeGroupEmails: true,
                  createdAt: '2024-07-03T20:03:11.903Z',
                  updatedAt: '2024-07-03T20:03:11.903Z',
                },
                {
                  id: '20202020-ef5a-4822-9e08-ce6e6a4dcb6a',
                  handle: 'test.test2@gmail.com',
                  connectedAccountId: '20202020-954c-4d76-9a87-e5f072d4b7ef',
                  type: 'email',
                  isSyncEnabled: true,
                  syncStage: 'MESSAGE_LIST_FETCH_PENDING',
                  syncStatus: 'COMPLETED',
                  visibility: 'SHARE_EVERYTHING',
                  contactAutoCreationPolicy: 'SENT',
                  isContactAutoCreationEnabled: true,
                  excludeNonProfessionalEmails: true,
                  excludeGroupEmails: true,
                  createdAt: '2024-07-03T20:03:11.903Z',
                  updatedAt: '2024-07-03T20:03:11.903Z',
                },
              ],
            },
          });
        }),
        graphql.query('MyCalendarChannels', () => {
          return HttpResponse.json({
            data: {
              myCalendarChannels: [],
            },
          });
        }),
      ],
    },
  },
};
