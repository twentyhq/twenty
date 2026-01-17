import { type Meta, type StoryObj } from '@storybook/react-vite';

import { SettingsAccountsBlocklistInput } from '@/settings/accounts/components/SettingsAccountsBlocklistInput';
import { type SettingsAccountsBlocklistSection } from '@/settings/accounts/components/SettingsAccountsBlocklistSection';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof SettingsAccountsBlocklistSection> = {
  title: 'Modules/Settings/Accounts/Blocklist/SettingsAccountsBlocklistSection',
  component: SettingsAccountsBlocklistInput,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof SettingsAccountsBlocklistSection>;

export const Default: Story = {};
