import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';

import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { sleep } from '~/utils/sleep';

import { SettingsAccountsCalendars } from '../SettingsAccountsCalendars';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Accounts/SettingsAccountsCalendars',
  component: SettingsAccountsCalendars,
  decorators: [PageDecorator],
  args: {
    routePath: getSettingsPagePath(SettingsPath.AccountsCalendars),
  },
  parameters: {
    layout: 'fullscreen',
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsAccountsCalendars>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    sleep(100);

    await canvas.findByText('Calendar settings');
  },
};
