import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui';

import { SettingsAccountsEmailsBlocklistInput } from '@/settings/accounts/components/SettingsAccountsEmailsBlocklistInput';
import { SettingsAccountsEmailsBlocklistSection } from '@/settings/accounts/components/SettingsAccountsEmailsBlocklistSection';

const meta: Meta<typeof SettingsAccountsEmailsBlocklistSection> = {
  title:
    'Modules/Settings/Accounts/Blocklist/SettingsAccountsEmailsBlocklistSection',
  component: SettingsAccountsEmailsBlocklistInput,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof SettingsAccountsEmailsBlocklistSection>;

export const Default: Story = {};
