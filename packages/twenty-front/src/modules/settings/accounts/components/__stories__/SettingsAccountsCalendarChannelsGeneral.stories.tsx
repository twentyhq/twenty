import { type Meta, type StoryObj } from '@storybook/react';

import { SettingsAccountsCalendarChannelsGeneral } from '@/settings/accounts/components/SettingsAccountsCalendarChannelsGeneral';
import { ComponentDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';

const meta: Meta<typeof SettingsAccountsCalendarChannelsGeneral> = {
  title:
    'Modules/Settings/Accounts/CalendarChannels/SettingsAccountsCalendarChannelsGeneral',
  component: SettingsAccountsCalendarChannelsGeneral,
  decorators: [
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
    I18nFrontDecorator,
  ],
};

export default meta;
type Story = StoryObj<typeof SettingsAccountsCalendarChannelsGeneral>;

export const Default: Story = {
  play: async () => {},
};
