import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';
import { graphql, HttpResponse } from 'msw';

import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedConnectedAccounts } from '~/testing/mock-data/accounts';
import { sleep } from '~/testing/sleep';

import { SettingsAccountsCalendarsSettings } from '../SettingsAccountsCalendarsSettings';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Accounts/SettingsAccountsCalendarsSettings',
  component: SettingsAccountsCalendarsSettings,
  decorators: [PageDecorator],
  args: {
    routePath: getSettingsPagePath(SettingsPath.AccountsCalendarsSettings),
    routeParams: { ':accountUuid': mockedConnectedAccounts[0].id },
  },
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [
        ...graphqlMocks.handlers,
        graphql.query('FindOneCalendarChannel', () => {
          return HttpResponse.json({
            data: {
              calendarChannel: {
                edges: [],
                pageInfo: {
                  hasNextPage: false,
                  hasPreviousPage: false,
                  startCursor: null,
                  endCursor: null,
                },
              },
            },
          });
        }),
      ],
    },
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsAccountsCalendarsSettings>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    sleep(100);

    await canvas.findByText('Event visibility');
  },
};
