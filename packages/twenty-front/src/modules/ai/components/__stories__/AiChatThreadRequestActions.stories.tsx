import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { ComponentDecorator } from 'twenty-ui/testing';

import { AiChatThreadRequestActions } from '@/ai/components/AiChatThreadRequestActions';

const onChoose = fn();
const onReview = fn();
const onReply = fn();

const meta: Meta<typeof AiChatThreadRequestActions> = {
  title: 'Modules/AI/AiChatThreadRequestActions',
  component: AiChatThreadRequestActions,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 560 } },
};

export default meta;
type Story = StoryObj<typeof AiChatThreadRequestActions>;

export const Choices: Story = {
  args: {
    request: {
      type: 'choices',
      choices: [
        {
          id: 'marco',
          label: 'Marco Rossi',
          avatar: <Avatar name="Marco Rossi" size="xs" />,
        },
        {
          id: 'sarah',
          label: 'Sarah Lin',
          avatar: <Avatar name="Sarah Lin" size="xs" />,
        },
        { id: 'me', label: 'Me', avatar: <Avatar name="Thomas" size="xs" /> },
      ],
      onChoose,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Sarah Lin' }));
    await expect(onChoose).toHaveBeenCalledWith('sarah');
    await expect(onChoose).toHaveBeenCalledTimes(1);
  },
};

export const ReviewSummary: Story = {
  args: {
    request: { type: 'review', label: 'Review 5 drafts', onReview },
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Review 5 drafts' }),
    );
    await expect(onReview).toHaveBeenCalledTimes(1);
  },
};

export const Reply: Story = {
  args: { request: { type: 'reply', onReply } },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Reply' });

    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(onReply).toHaveBeenCalledTimes(1);
  },
};

export const Pending: Story = {
  args: { ...Choices.args, isLoading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Sarah Lin' });

    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await expect(onChoose).not.toHaveBeenCalled();
  },
};

export const NarrowChoices: Story = {
  args: Choices.args,
  parameters: { container: { width: 220 } },
};
