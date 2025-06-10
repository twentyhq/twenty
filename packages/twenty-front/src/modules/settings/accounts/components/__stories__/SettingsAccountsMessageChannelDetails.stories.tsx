import { Meta, StoryObj } from '@storybook/react';

import { MessageChannelContactAutoCreationPolicy } from '@/accounts/types/MessageChannel';
import { SettingsAccountsMessageChannelDetails } from '@/settings/accounts/components/SettingsAccountsMessageChannelDetails';
import { MessageChannelVisibility } from '~/generated/graphql';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof SettingsAccountsMessageChannelDetails> = {
  title:
    'Modules/Settings/Accounts/MessageChannels/SettingsAccountsMessageChannelDetails',
  component: SettingsAccountsMessageChannelDetails,
  decorators: [
    ComponentDecorator,
    I18nFrontDecorator,
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
      visibility: MessageChannelVisibility.SHARE_EVERYTHING,
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
