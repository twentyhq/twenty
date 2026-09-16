import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { SettingsAccountsMessageChannelDetails } from '@/settings/accounts/components/SettingsAccountsMessageChannelDetails';
import {
  MessageChannelContactAutoCreationPolicy,
  MessageChannelType,
  MessageFolderImportPolicy,
} from 'twenty-shared/types';
import { ComponentDecorator } from 'twenty-ui/testing';
import { MessageChannelVisibility } from '~/generated/graphql';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const mockedMessageChannel = {
  id: '20202020-ef5a-4822-9e08-ce6e6a4dcb6a',
  type: MessageChannelType.EMAIL,
  contactAutoCreationPolicy: MessageChannelContactAutoCreationPolicy.SENT,
  excludeNonProfessionalEmails: true,
  excludeGroupEmails: false,
  isSyncEnabled: true,
  visibility: MessageChannelVisibility.SHARE_EVERYTHING,
  messageFolderImportPolicy: MessageFolderImportPolicy.ALL_FOLDERS,
};

const meta: Meta<typeof SettingsAccountsMessageChannelDetails> = {
  title:
    'Modules/Settings/Accounts/MessageChannels/SettingsAccountsMessageChannelDetails',
  component: SettingsAccountsMessageChannelDetails,
  decorators: [
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    ToastDecorator,
  ],
  args: {
    messageChannel: mockedMessageChannel,
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

export const EmailGroup: Story = {
  args: {
    messageChannel: {
      ...mockedMessageChannel,
      type: MessageChannelType.EMAIL_GROUP,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText('Contact auto-creation'),
    ).toBeInTheDocument();
    expect(canvas.getByText('Exclude group emails')).toBeInTheDocument();
    expect(
      canvas.getByText('Exclude non-professional emails'),
    ).toBeInTheDocument();
    expect(canvas.queryByText('Visibility')).not.toBeInTheDocument();
    expect(canvas.queryByText('Import')).not.toBeInTheDocument();
  },
};
