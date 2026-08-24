import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { SettingsApplicationTimelineActivityTypesListCard } from '~/pages/settings/applications/components/SettingsApplicationTimelineActivityTypesListCard';

const meta: Meta<typeof SettingsApplicationTimelineActivityTypesListCard> = {
  title:
    'Pages/Settings/Applications/SettingsApplicationTimelineActivityTypesListCard',
  component: SettingsApplicationTimelineActivityTypesListCard,
  args: {
    canReset: true,
    isLoading: false,
    mutatingTimelineActivityTypeIds: new Set(),
    timelineActivityTypes: [
      {
        action: 'linked',
        icon: 'IconPaperclip',
        id: 'attachment-linked',
        isActive: true,
        isInstalled: true,
        label: 'Attached a file',
        name: 'attachmentLinked',
      },
      {
        action: 'unlinked',
        icon: 'IconUnlink',
        id: 'attachment-unlinked',
        isActive: false,
        isInstalled: true,
        label: 'Removed an attachment',
        name: 'attachmentUnlinked',
      },
    ],
    onReset: fn(),
    onToggle: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof SettingsApplicationTimelineActivityTypesListCard>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole('switch', { name: 'Active Attached a file' }),
    );

    expect(args.onToggle).toHaveBeenCalledWith('attachment-linked', false);

    await userEvent.click(
      canvas.getAllByRole('button', { name: 'More options' })[0],
    );

    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(await page.findByText('Reset to default'));

    expect(args.onReset).toHaveBeenCalledWith('attachment-linked');
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};
