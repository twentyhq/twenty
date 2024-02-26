import { Meta, StoryObj } from '@storybook/react';

import { mockedBlocklist } from '@/settings/accounts/components/__stories__/mockedBlocklist';
import { SettingsAccountsEmailsBlocklistTableRow } from '@/settings/accounts/components/SettingsAccountsEmailsBlocklistTableRow';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

const meta: Meta<typeof SettingsAccountsEmailsBlocklistTableRow> = {
  title: 'Modules/Settings/Accounts/SettingsAccountsEmailsBlocklistTableRow',
  component: SettingsAccountsEmailsBlocklistTableRow,
  decorators: [ComponentDecorator],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof SettingsAccountsEmailsBlocklistTableRow>;

export const Default: Story = {
  render: () => (
    <SettingsAccountsEmailsBlocklistTableRow
      blocklistItem={mockedBlocklist[0]}
      onRemove={() => {}}
    />
  ),
};
