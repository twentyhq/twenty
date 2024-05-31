import { Meta, StoryObj } from '@storybook/react';

import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { PrefetchLoadingDecorator } from '~/testing/decorators/PrefetchLoadingDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { SettingsAccountsEmails } from '../SettingsAccountsEmails';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Accounts/SettingsAccountsEmails',
  component: SettingsAccountsEmails,
  decorators: [PrefetchLoadingDecorator, PageDecorator],
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

export const Default: Story = {};
