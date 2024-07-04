import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui';

import { SettingsAccountsMessageChannelDetails } from '@/settings/accounts/components/SettingsAccountsMessageChannelDetails';
import { MessageChannelVisibility } from '~/generated/graphql';

const meta: Meta<typeof SettingsAccountsMessageChannelDetails> = {
  title:
    'Modules/Settings/Accounts/MessageChannels/SettingsAccountsMessageChannelDetails',
  component: SettingsAccountsMessageChannelDetails,
  decorators: [ComponentDecorator],
  args: {
    messageChannel: {
      handle: 'test.test2@gmail.com',
      excludeNonProfessionalEmails: true,
      syncStageStartedAt: null,
      id: '20202020-ef5a-4822-9e08-ce6e6a4dcb6a',
      updatedAt: '2024-07-03T20:03:11.903Z',
      createdAt: '2024-07-03T20:03:11.903Z',
      connectedAccountId: '20202020-954c-4d76-9a87-e5f072d4b7ef',
      contactAutoCreationPolicy: 'SENT',
      syncStage: 'PARTIAL_MESSAGE_LIST_FETCH_PENDING',
      type: 'email',
      isContactAutoCreationEnabled: true,
      syncCursor: '1562764',
      excludeGroupEmails: true,
      throttleFailureCount: 0,
      isSyncEnabled: true,
      visibility: MessageChannelVisibility.ShareEverything,
      syncStatus: 'COMPLETED',
      syncedAt: '2024-07-04T16:25:04.960Z',
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
