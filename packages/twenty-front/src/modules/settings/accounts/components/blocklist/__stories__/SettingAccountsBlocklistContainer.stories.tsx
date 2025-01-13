/* eslint-disable react/jsx-props-no-spreading */
import { mockedBlocklist } from '@/settings/accounts/components/blocklist/__stories__/mockedBlocklist';
import { SettingsAccountsBlocklistContactRow } from '@/settings/accounts/components/blocklist/components/SettingAccountsBlocklistContactRow';
import { Meta, StoryFn } from '@storybook/react';

export default {
  title: 'Settings/Accounts/BlocklistContactRow',
  component: SettingsAccountsBlocklistContactRow,
  argTypes: {
    item: {
      control: 'object',
      description: 'Blocklist item data to display',
    },
  },
} as Meta<typeof SettingsAccountsBlocklistContactRow>;

const Template: StoryFn<typeof SettingsAccountsBlocklistContactRow> = (
  args,
) => <SettingsAccountsBlocklistContactRow {...args} />;

export const Default = Template.bind({});
Default.args = {
  item: undefined,
};

export const WithItem = Template.bind({});
WithItem.args = {
  item: mockedBlocklist[0],
};

export const UpdatingItem = Template.bind({});
UpdatingItem.args = {
  item: mockedBlocklist[2],
};
