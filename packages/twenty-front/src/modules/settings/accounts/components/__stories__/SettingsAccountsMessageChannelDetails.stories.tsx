import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui';

import { MessageChannelContactAutoCreationPolicy } from '@/accounts/types/MessageChannel';
import { SettingsAccountsMessageChannelDetails } from '@/settings/accounts/components/SettingsAccountsMessageChannelDetails';
import { MessageChannelVisibility } from '~/generated/graphql';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';

const meta: Meta<typeof SettingsAccountsMessageChannelDetails> = {
  title:
    'Modules/Settings/Accounts/MessageChannels/SettingsAccountsMessageChannelDetails',
  component: SettingsAccountsMessageChannelDetails,
  decorators: [
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
  ],
  args: {
    messageChannel: {
      id: '20202020-ef5a-4822-9e08-ce6e6a4dcb6a',
      contactAutoCreationPolicy: MessageChannelContactAutoCreationPolicy.SENT,
      excludeNonProfessionalEmails: true,
      excludeGroupEmails: false,
      isSyncEnabled: true,
      visibility: MessageChannelVisibility.ShareEverything,
    },
  },
  argTypes: {
    messageChannel: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof SettingsAccountsMessageChannelDetails>;

export const Default: Story = {
  play: async () => {},
};
