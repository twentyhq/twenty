import { SettingsAppPreferencesMessageChannelContent } from '@/settings/app-preferences/components/SettingsAppPreferencesMessageChannelContent';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { CatalogDecorator } from 'twenty-ui/testing';
import {
  getAppPreferencesChannelMocks,
  messageFolderQueries,
  MOCKED_SECOND_GOOGLE_ACCOUNT,
} from '~/pages/settings/app-preferences/__stories__/mockedAppPreferencesChannels';
import { prepareAppPreferencesStory } from '~/pages/settings/app-preferences/__stories__/mockedAppPreferencesData';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const channelMocks = getAppPreferencesChannelMocks({
  accounts: [MOCKED_SECOND_GOOGLE_ACCOUNT],
});
const meta: Meta<typeof SettingsAppPreferencesMessageChannelContent> = {
  title:
    'Modules/Settings/AppPreferences/SettingsAppPreferencesMessageChannelContent',
  component: SettingsAppPreferencesMessageChannelContent,
  decorators: [CatalogDecorator, ComponentWithRouterDecorator, ToastDecorator],
  args: {
    connectedAccount: MOCKED_SECOND_GOOGLE_ACCOUNT,
    messageChannel: MOCKED_SECOND_GOOGLE_ACCOUNT.messageChannels[0],
  },
  parameters: {
    msw: channelMocks,
    catalog: { options: { elementContainer: { width: 640 } } },
  },
  beforeEach: async () => {
    channelMocks.reset();
    return prepareAppPreferencesStory();
  },
};

export default meta;
type Story = StoryObj<typeof SettingsAppPreferencesMessageChannelContent>;

export const SelectedChannelFolders: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText('Second Account Folder'),
    ).toBeVisible();
    await expect(messageFolderQueries).toHaveBeenLastCalledWith(
      'second-google-message-channel',
    );
    await expect(messageFolderQueries).not.toHaveBeenCalledWith(undefined);
    await expect(
      canvas.getByRole('switch', { name: 'Exclude group emails' }),
    ).toBeVisible();
  },
};

export const SharedMemberCannotEdit: Story = {
  args: {
    connectedAccount: {
      userWorkspaceId: 'another-owner',
      visibility: 'workspace',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText(
        'This shared account is managed by its owner or a workspace administrator.',
      ),
    ).toBeVisible();
    await expect(canvas.queryByRole('switch')).not.toBeInTheDocument();
    await expect(messageFolderQueries).not.toHaveBeenCalled();
  },
};
