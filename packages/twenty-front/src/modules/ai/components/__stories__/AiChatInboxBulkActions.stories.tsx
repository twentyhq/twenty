import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { AiChatInboxBulkActions } from '@/ai/components/AiChatInboxBulkActions';

const meta: Meta<typeof AiChatInboxBulkActions> = {
  title: 'Modules/AI/AiChatInboxBulkActions',
  component: AiChatInboxBulkActions,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 560 } },
  args: {
    selectedCount: 3,
    onDone: fn(),
    onSnooze: fn(),
    onClearSelection: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof AiChatInboxBulkActions>;

export const Selection: Story = {
  args: { onMarkAllDone: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('3 selected')).toBeVisible();
    await expect(
      canvas.queryByRole('button', { name: 'Mark all done' }),
    ).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Snooze' }));
    await expect(args.onSnooze).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByRole('button', { name: 'Done' }));
    await expect(args.onDone).toHaveBeenCalledTimes(1);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Clear selection' }),
    );
    await expect(args.onClearSelection).toHaveBeenCalledTimes(1);
    await expect(args.onMarkAllDone).not.toHaveBeenCalled();
  },
};

export const MarkAllDone: Story = {
  args: { selectedCount: 0, onMarkAllDone: fn() },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Mark all done' }),
    );
    await expect(args.onMarkAllDone).toHaveBeenCalledTimes(1);
    await expect(args.onDone).not.toHaveBeenCalled();
  },
};

export const NoAllMatchingAction: Story = {
  args: { selectedCount: 0 },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).queryByRole('button'),
    ).not.toBeInTheDocument();
  },
};

export const Pending: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Done' });

    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await expect(args.onDone).not.toHaveBeenCalled();
  },
};

export const NarrowSelection: Story = {
  parameters: { container: { width: 240 } },
};
