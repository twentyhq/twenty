import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui';

import { SettingsAccountsBlocklistInput } from '@/settings/accounts/components/SettingsAccountsBlocklistInput';
import { SettingsAccountsBlocklistSection } from '@/settings/accounts/components/SettingsAccountsBlocklistSection';

const meta: Meta<typeof SettingsAccountsBlocklistSection> = {
  title: 'Modules/Settings/Accounts/Blocklist/SettingsAccountsBlocklistSection',
  component: SettingsAccountsBlocklistInput,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof SettingsAccountsBlocklistSection>;

export const Default: Story = {};
