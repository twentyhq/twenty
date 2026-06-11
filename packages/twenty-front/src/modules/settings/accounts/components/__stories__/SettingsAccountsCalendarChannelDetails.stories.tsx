import { type Meta, type StoryObj } from '@storybook/react-vite';

import { SettingsAccountsCalendarChannelDetails } from '@/settings/accounts/components/SettingsAccountsCalendarChannelDetails';
import { ComponentDecorator } from 'twenty-ui-deprecated/testing';
import { CalendarChannelVisibility } from '~/generated/graphql';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';

const meta: Meta<typeof SettingsAccountsCalendarChannelDetails> = {
  title:
    'Modules/Settings/Accounts/CalendarChannels/SettingsAccountsCalendarChannelDetails',
  component: SettingsAccountsCalendarChannelDetails,
  decorators: [
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
  ],
  args: {
    calendarChannel: {
      id: '20202020-ef5a-4822-9e08-ce6e6a4dcb6a',
      isContactAutoCreationEnabled: true,
      isSyncEnabled: true,
      visibility: CalendarChannelVisibility.SHARE_EVERYTHING,
      syncedCategories: [],
      connectedAccountId: '20202020-44b8-4325-b9e7-4ad4a2f0c648',
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
