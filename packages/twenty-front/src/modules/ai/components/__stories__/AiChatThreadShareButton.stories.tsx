import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { AiChatThreadShareButton } from '@/ai/components/AiChatThreadShareButton';

const meta = {
  title: 'Modules/AI/AiChatThreadShareButton',
  component: AiChatThreadShareButton,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 400 } },
  args: { onClick: fn() },
} satisfies Meta<typeof AiChatThreadShareButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithoutAccessProjection: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Share' }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const WithAccessMembers: Story = {
  args: {
    accessMembers: [
      { id: 'thomas', name: 'Thomas' },
      { id: 'sarah', name: 'Sarah Lin' },
      { id: 'marco', name: 'Marco Rossi' },
    ],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Share' });

    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const MoreAccessMembers: Story = {
  args: {
    accessMembers: [
      { id: 'thomas', name: 'Thomas' },
      { id: 'sarah', name: 'Sarah Lin' },
      { id: 'marco', name: 'Marco Rossi' },
      { id: 'alex', name: 'Alex' },
      { id: 'maria', name: 'Maria' },
    ],
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Share' });

    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Share' });

    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
