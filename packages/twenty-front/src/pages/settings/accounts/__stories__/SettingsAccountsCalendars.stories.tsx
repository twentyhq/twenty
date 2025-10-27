import { type Meta, type StoryObj } from '@storybook/react';
import { HttpResponse, graphql } from 'msw';
import { SettingsAccountsCalendars } from '~/pages/settings/accounts/SettingsAccountsCalendars';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Accounts/SettingsAccountsCalendars',
  component: SettingsAccountsCalendars,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/accounts/calendars',
  },
  parameters: {
    layout: 'fullscreen',
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsAccountsCalendars>;

export const NoConnectedAccount: Story = {};

export const TwoConnectedAccounts: Story = {
  parameters: {
    msw: {
      handlers: [
        ...graphqlMocks.handlers,
        graphql.query('FindManyConnectedAccounts', () => {
          return HttpResponse.json({
            data: {
              connectedAccounts: {
                __typename: 'ConnectedAccountConnection',
                totalCount: 1,
                pageInfo: {
                  __typename: 'PageInfo',
                  hasNextPage: false,
                  startCursor: '',
                  endCursor: '',
                },
                edges: [
                  {
                    __typename: 'ConnectedAccountEdge',
                    cursor: '',
                    node: {
                      __typename: 'ConnectedAccount',
                      accessToken: '',
                      refreshToken: '',
                      updatedAt: '2024-07-03T20:03:35.064Z',
                      createdAt: '2024-07-03T20:03:35.064Z',
                      id: '20202020-954c-4d76-9a87-e5f072d4b7ef',
                      provider: 'google',
                      accountOwnerId: '20202020-03f2-4d83-b0d5-2ec2bcee72d4',
                      lastSyncHistoryId: '',
                      handleAliases: '',
                      handle: 'test.test@gmail.com',
                      authFailedAt: null,
                    },
                  },
                ],
              },
            },
          });
        }),
        graphql.query('FindManyCalendarChannels', () => {
          return HttpResponse.json({
            data: {
              calendarChannels: {
                __typename: 'CalendarChannelConnection',
                totalCount: 2,
                pageInfo: {
                  __typename: 'PageInfo',
                  hasNextPage: false,
                  startCursor: '',
                  endCursor: '',
                },
                edges: [
                  {
                    __typename: 'CalendarChannelEdge',
                    cursor: '',
                    node: {
                      __typename: 'CalendarChannel',
                      handle: 'test.test@gmail.com',
                      excludeNonProfessionalEmails: true,
                      syncStageStartedAt: null,
                      id: '20202020-ef5a-4822-9e08-ce6e6a4dcb6f',
                      updatedAt: '2024-07-03T20:03:11.903Z',
                      createdAt: '2024-07-03T20:03:11.903Z',
                      connectedAccountId:
                        '20202020-954c-4d76-9a87-e5f072d4b7ef',
                      contactAutoCreationPolicy: 'SENT',
                      syncStage: 'CALENDAR_EVENT_LIST_FETCH_PENDING',
                      type: 'email',
                      isContactAutoCreationEnabled: true,
                      syncCursor: '1562764',
                      excludeGroupEmails: true,
                      throttleFailureCount: 0,
                      isSyncEnabled: true,
                      visibility: 'SHARE_EVERYTHING',
                      syncStatus: 'COMPLETED',
                      syncedAt: '2024-07-04T16:25:04.960Z',
                    },
                  },
                  {
                    __typename: 'CalendarChannelEdge',
                    cursor: '',
                    node: {
                      __typename: 'CalendarChannel',
                      handle: 'test.test2@gmail.com',
                      excludeNonProfessionalEmails: true,
                      syncStageStartedAt: null,
                      id: '20202020-ef5a-4822-9e08-ce6e6a4dcb6a',
                      updatedAt: '2024-07-03T20:03:11.903Z',
                      createdAt: '2024-07-03T20:03:11.903Z',
                      connectedAccountId:
                        '20202020-954c-4d76-9a87-e5f072d4b7ef',
                      contactAutoCreationPolicy: 'SENT',
                      syncStage: 'PARTIAL_CALENDAR_EVENT_LIST_FETCH_PENDING',
                      type: 'email',
                      isContactAutoCreationEnabled: true,
                      syncCursor: '1562764',
                      excludeGroupEmails: true,
                      throttleFailureCount: 0,
                      isSyncEnabled: true,
                      visibility: 'SHARE_EVERYTHING',
                      syncStatus: 'COMPLETED',
                      syncedAt: '2024-07-04T16:25:04.960Z',
                    },
                  },
                ],
              },
            },
          });
        }),
      ],
    },
  },
};
