import { type Meta, type StoryObj } from '@storybook/react';

import { SettingsAccountsCalendarChannelDetails } from '@/settings/accounts/components/SettingsAccountsCalendarChannelDetails';
import { CalendarChannelVisibility } from '~/generated/graphql';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof SettingsAccountsCalendarChannelDetails> = {
  title:
    'Modules/Settings/Accounts/CalendarChannels/SettingsAccountsCalendarChannelDetails',
  component: SettingsAccountsCalendarChannelDetails,
  decorators: [
    ComponentDecorator,
    I18nFrontDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
  ],
  args: {
    calendarChannel: {
      id: '20202020-ef5a-4822-9e08-ce6e6a4dcb6a',
      isContactAutoCreationEnabled: true,
      isSyncEnabled: true,
      visibility: CalendarChannelVisibility.SHARE_EVERYTHING,
    },
  },
  argTypes: {
    calendarChannel: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof SettingsAccountsCalendarChannelDetails>;

export const Default: Story = {
  play: async () => {},
};
