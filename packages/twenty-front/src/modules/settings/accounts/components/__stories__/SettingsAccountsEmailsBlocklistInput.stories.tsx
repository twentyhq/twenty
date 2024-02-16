import { Meta, StoryObj } from '@storybook/react';

import { SettingsAccountsEmailsBlocklistInput } from '@/settings/accounts/components/SettingsAccountsEmailsBlocklistInput';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

const meta: Meta<typeof SettingsAccountsEmailsBlocklistInput> = {
  title: 'Modules/Settings/Accounts/SettingsAccountsEmailsBlocklistInput',
  component: SettingsAccountsEmailsBlocklistInput,
  decorators: [ComponentDecorator],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof SettingsAccountsEmailsBlocklistInput>;

export const Default: Story = {
  render: () => (
    <SettingsAccountsEmailsBlocklistInput updateBlockedEmailList={() => {}} />
  ),
};
