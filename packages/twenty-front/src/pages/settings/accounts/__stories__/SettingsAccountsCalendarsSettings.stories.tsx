import { Meta, StoryObj } from '@storybook/react';

import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedConnectedAccounts } from '~/testing/mock-data/accounts';

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
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsAccountsCalendarsSettings>;

export const Default: Story = {};
