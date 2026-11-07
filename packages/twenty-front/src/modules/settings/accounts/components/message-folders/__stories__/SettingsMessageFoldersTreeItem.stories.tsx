import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { MessageFolderPendingSyncAction } from 'twenty-shared/types';
import { ComponentDecorator } from 'twenty-ui/testing';

import { type MessageFolder } from '@/accounts/types/MessageFolder';
import { SettingsMessageFoldersTreeItem } from '@/settings/accounts/components/message-folders/SettingsMessageFoldersTreeItem';
import { computeMessageFolderTree } from '@/settings/accounts/components/message-folders/utils/computeMessageFolderTree';

const createFolder = ({
  id,
  name,
  parentFolderId,
}: Pick<MessageFolder, 'id' | 'name' | 'parentFolderId'>): MessageFolder => ({
  id,
  name,
  parentFolderId,
  externalId: id,
  isSynced: false,
  isSentFolder: false,
  pendingSyncAction: MessageFolderPendingSyncAction.NONE,
  messageChannelId: 'mail-channel',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  __typename: 'MessageFolder',
});

const ROOT_FOLDER = createFolder({
  id: 'work',
  name: 'Work',
  parentFolderId: null,
});
const FOLDER_TREE = computeMessageFolderTree([
  ROOT_FOLDER,
  createFolder({ id: 'team', name: 'Team', parentFolderId: 'work' }),
  createFolder({ id: 'planning', name: 'Planning', parentFolderId: 'team' }),
]);

const meta: Meta<typeof SettingsMessageFoldersTreeItem> = {
  title: 'Modules/Settings/Accounts/SettingsMessageFoldersTreeItem',
  component: SettingsMessageFoldersTreeItem,
  decorators: [ComponentDecorator],
  args: { folderTreeNode: FOLDER_TREE[0], onToggleFolder: fn() },
  parameters: { container: { width: 400 } },
  render: (args) => (
    <ul>
      <SettingsMessageFoldersTreeItem
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...args}
      />
    </ul>
  ),
};

export default meta;
type Story = StoryObj<typeof SettingsMessageFoldersTreeItem>;

export const PreservesNestedExpansion: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const [rootToggle, nestedToggle] = canvas.getAllByRole('button', {
      name: 'Collapse folder',
    });
    expect(rootToggle).toHaveAttribute('aria-expanded', 'true');
    expect(rootToggle).toHaveAttribute('aria-controls');
    await userEvent.click(nestedToggle);
    await waitFor(() => {
      expect(nestedToggle).toHaveAttribute('aria-expanded', 'false');
      expect(canvas.getByText('Planning')).not.toBeVisible();
    });
    await userEvent.click(rootToggle);
    await waitFor(() =>
      expect(rootToggle).toHaveAttribute('aria-expanded', 'false'),
    );
    await userEvent.keyboard('{Enter}');
    await waitFor(() => {
      expect(rootToggle).toHaveAttribute('aria-expanded', 'true');
      expect(nestedToggle).toBeVisible();
      expect(nestedToggle).toHaveAttribute('aria-expanded', 'false');
      expect(canvas.getByText('Planning')).not.toBeVisible();
    });
    await userEvent.click(canvas.getAllByRole('checkbox')[0]);
    expect(args.onToggleFolder).toHaveBeenCalledWith(ROOT_FOLDER);
    expect(rootToggle).toHaveAttribute('aria-expanded', 'true');
  },
};
