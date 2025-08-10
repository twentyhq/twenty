import { type Meta, type StoryObj } from '@storybook/react';

import { SettingsNewAccount } from '~/pages/settings/accounts/SettingsNewAccount';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Accounts/SettingsNewAccount',
  component: SettingsNewAccount,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/accounts/new',
  },
  parameters: {
    layout: 'fullscreen',
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsNewAccount>;

export const Default: Story = {};
