import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui';

import { SettingsAccountsCalendarChannelsGeneral } from '@/settings/accounts/components/SettingsAccountsCalendarChannelsGeneral';

const meta: Meta<typeof SettingsAccountsCalendarChannelsGeneral> = {
  title:
    'Modules/Settings/Accounts/CalendarChannels/SettingsAccountsCalendarChannelsGeneral',
  component: SettingsAccountsCalendarChannelsGeneral,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof SettingsAccountsCalendarChannelsGeneral>;

export const Default: Story = {
  play: async () => {},
};
