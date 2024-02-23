import { Meta, StoryObj } from '@storybook/react';

import { SettingsAccountsEmailsBlocklistTableRow } from '@/settings/accounts/components/SettingsAccountsEmailsBlocklistTableRow';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { formatToHumanReadableDate } from '~/utils';

const meta: Meta<typeof SettingsAccountsEmailsBlocklistTableRow> = {
  title: 'Modules/Settings/Accounts/SettingsAccountsEmailsBlocklistTableRow',
  component: SettingsAccountsEmailsBlocklistTableRow,
  decorators: [ComponentDecorator],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof SettingsAccountsEmailsBlocklistTableRow>;

const mockedBlocklistItem = {
  id: '1',
  handle: 'test@twenty.com',
  workspaceMemberId: '1',
  createdAt: formatToHumanReadableDate(new Date().toISOString()),
};

export const Default: Story = {
  render: () => (
    <SettingsAccountsEmailsBlocklistTableRow
      blocklistItem={mockedBlocklistItem}
      onRemove={() => {}}
    />
  ),
};
