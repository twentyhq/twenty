import { AttachmentDropdown } from '@/activities/files/components/AttachmentDropdown';
import { ParentClickOutsideIdContext } from '@/ui/utilities/pointer-event/contexts/ParentClickOutsideIdContext';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type ComponentProps } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Button } from 'twenty-ui/primitives/input';
import { ComponentDecorator } from 'twenty-ui/testing';

const ATTACHMENT_PARENT_CLICK_OUTSIDE_ID = 'attachment-parent';

type AttachmentDropdownStoryProps = ComponentProps<
  typeof AttachmentDropdown
> & {
  onRowClick: () => void;
  onOutside: () => void;
};

const AttachmentDropdownStory = ({
  onRowClick,
  onOutside,
  ...attachmentProps
}: AttachmentDropdownStoryProps) => {
  useListenClickOutside({
    listenerId: 'attachment-background-board',
    excludedClickOutsideIds: [ATTACHMENT_PARENT_CLICK_OUTSIDE_ID],
    refs: [],
    callback: onOutside,
  });

  return (
    <>
      <ParentClickOutsideIdContext.Provider
        value={ATTACHMENT_PARENT_CLICK_OUTSIDE_ID}
      >
        <div
          onClick={onRowClick}
          data-click-outside-id={ATTACHMENT_PARENT_CLICK_OUTSIDE_ID}
        >
          <AttachmentDropdown {...attachmentProps} />
        </div>
      </ParentClickOutsideIdContext.Provider>
      <Button>Outside attachment</Button>
    </>
  );
};

const meta: Meta<typeof AttachmentDropdownStory> = {
  title: 'Modules/Activities/Files/AttachmentDropdown',
  component: AttachmentDropdownStory,
  decorators: [ComponentDecorator],
  args: {
    attachmentId: 'attachment',
    hasDownloadPermission: true,
    onDownload: fn(),
    onDelete: fn(),
    onRename: fn(),
    onRowClick: fn(),
    onOutside: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof AttachmentDropdownStory>;

export const DownloadPreservesSelection: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'More options' });

    await userEvent.click(trigger);
    await expect(
      (await canvas.findAllByRole('menuitem')).map((item) => item.textContent),
    ).toEqual(['Download', 'Rename', 'Delete']);
    await userEvent.click(canvas.getByRole('menuitem', { name: 'Download' }));

    await expect(args.onDownload).toHaveBeenCalledTimes(1);
    await expect(args.onOutside).not.toHaveBeenCalled();
    await expect(args.onRowClick).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(canvas.queryByRole('menu')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.click(
      canvas.getByRole('button', { name: 'Outside attachment' }),
    );
    await expect(args.onOutside).toHaveBeenCalledTimes(1);
  },
};

export const KeyboardDeletionWithoutDownloadPermission: Story = {
  args: { hasDownloadPermission: false },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'More options' });
    trigger.focus();

    await userEvent.keyboard('{ArrowDown}');
    const rename = await canvas.findByRole('menuitem', { name: 'Rename' });
    await waitFor(() => expect(rename).toHaveFocus());
    await expect(
      canvas.queryByRole('menuitem', { name: 'Download' }),
    ).not.toBeInTheDocument();
    await userEvent.keyboard('{ArrowDown}{Enter}');

    await expect(args.onDelete).toHaveBeenCalledTimes(1);
    await expect(args.onRename).not.toHaveBeenCalled();
    await expect(args.onRowClick).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(canvas.queryByRole('menu')).not.toBeInTheDocument(),
    );
  },
};
