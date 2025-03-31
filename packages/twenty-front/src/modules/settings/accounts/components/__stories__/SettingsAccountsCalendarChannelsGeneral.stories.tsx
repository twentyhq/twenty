import { Meta, StoryObj } from '@storybook/react';

import { SettingsAccountsCalendarChannelsGeneral } from '@/settings/accounts/components/SettingsAccountsCalendarChannelsGeneral';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof SettingsAccountsCalendarChannelsGeneral> = {
  title:
    'Modules/Settings/Accounts/CalendarChannels/SettingsAccountsCalendarChannelsGeneral',
  component: SettingsAccountsCalendarChannelsGeneral,
  decorators: [
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
  ],
};

export default meta;
type Story = StoryObj<typeof SettingsAccountsCalendarChannelsGeneral>;

export const Default: Story = {
  play: async () => {},
};
