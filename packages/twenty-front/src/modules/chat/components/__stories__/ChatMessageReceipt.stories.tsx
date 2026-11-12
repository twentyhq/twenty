import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { ChatMessageReceipt } from '@/chat/components/ChatMessageReceipt';

const meta: Meta<typeof ChatMessageReceipt> = {
  title: 'Modules/Chat/ChatMessageReceipt',
  component: ChatMessageReceipt,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof ChatMessageReceipt>;

export const Sending: Story = {
  args: { status: 'sending' },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('img', { name: 'Sending' }),
    ).toBeVisible();
  },
};

export const Sent: Story = {
  args: { status: 'sent' },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('img', { name: 'Sent' }),
    ).toBeVisible();
  },
};

export const Read: Story = {
  args: { status: 'read' },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('img', { name: 'Read' }),
    ).toBeVisible();
  },
};
