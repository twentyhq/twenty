import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { ComponentDecorator } from 'twenty-ui/testing';
import { FilePreviewDialog } from '@/ui/field/display/components/FilePreviewDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';

const meta: Meta<typeof FilePreviewDialog> = {
  title: 'UI/Field/FilePreviewDialog',
  component: FilePreviewDialog,
  decorators: [ComponentDecorator],
  args: {
    dialogId: 'file-preview-story',
    scrollWrapperId: 'file-preview-story',
    title: 'Archive.zip',
    documentName: 'Archive.zip',
    documentUrl: 'https://example.com/archive.zip',
    downloadLabel: 'Download attachment',
    loadingFallback: <Text>Loading document viewer...</Text>,
    onClose: fn(),
    onDownload: fn(),
  },
  render: (args) => {
    const { openDialog, closeDialog } = useDialog();
    return (
      <>
        <Button onClick={() => openDialog(args.dialogId)}>Open preview</Button>
        <FilePreviewDialog
          // oxlint-disable-next-line react/jsx-props-no-spreading
          {...args}
          onClose={() => {
            closeDialog(args.dialogId);
            args.onClose();
          }}
        />
      </>
    );
  },
};

export default meta;
type Story = StoryObj<typeof FilePreviewDialog>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Open preview' });
    await userEvent.click(trigger);
    const dialog = await body.findByRole('dialog', { name: 'Archive.zip' });
    expect(dialog).toHaveAttribute('data-size', 'lg');
    expect(
      within(dialog).getByRole('heading', { name: 'Archive.zip' }),
    ).toHaveAttribute('data-size', 'md');
    await within(dialog).findByText(
      'Archive files cannot be previewed. Please download the file to access its contents.',
      {},
      { timeout: 10000 },
    );
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Download attachment' }),
    );
    expect(args.onDownload).toHaveBeenCalledOnce();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(args.onClose).toHaveBeenCalledOnce());
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const WithoutDownloadAction: Story = {
  args: { onDownload: undefined, onClose: fn() },
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Open preview' }),
    );
    const dialog = await body.findByRole('dialog', { name: 'Archive.zip' });
    expect(
      within(dialog).queryByRole('button', { name: 'Download attachment' }),
    ).toBeNull();
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Close preview' }),
    );
    await waitFor(() => expect(args.onClose).toHaveBeenCalledOnce());
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};
