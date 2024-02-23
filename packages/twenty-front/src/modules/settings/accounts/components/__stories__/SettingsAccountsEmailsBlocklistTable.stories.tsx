import { Meta, StoryObj } from '@storybook/react';

import { SettingsAccountsEmailsBlocklistTable } from '@/settings/accounts/components/SettingsAccountsEmailsBlocklistTable';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

const meta: Meta<typeof SettingsAccountsEmailsBlocklistTable> = {
  title: 'Modules/Settings/Accounts/SettingsAccountsEmailsBlocklistTable',
  component: SettingsAccountsEmailsBlocklistTable,
  decorators: [ComponentDecorator],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof SettingsAccountsEmailsBlocklistTable>;

export const Default: Story = {
  render: () => (
    <SettingsAccountsEmailsBlocklistTable
      blocklist={[]}
      handleBlockedEmailRemove={() => {}}
    />
  ),
};
