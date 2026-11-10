import { type Meta, type StoryObj } from '@storybook/react-vite';
import { ComponentDecorator } from 'twenty-ui/testing';

import { ChatMessageReceipt } from '@/chat/components/ChatMessageReceipt';

const meta: Meta<typeof ChatMessageReceipt> = {
  title: 'Modules/Chat/ChatMessageReceipt',
  component: ChatMessageReceipt,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof ChatMessageReceipt>;

export const Sending: Story = { args: { status: 'sending' } };

export const Sent: Story = { args: { status: 'sent' } };

export const Read: Story = { args: { status: 'read' } };
