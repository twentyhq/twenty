import { type Meta, type StoryObj } from '@storybook/react-vite';
import { ComponentDecorator } from 'twenty-ui/testing';

import { AiChatThreadReasonBadge } from '@/ai/components/AiChatThreadReasonBadge';

const meta = {
  title: 'Modules/AI/AiChatThreadReasonBadge',
  component: AiChatThreadReasonBadge,
  decorators: [ComponentDecorator],
  args: { isUnread: true },
} satisfies Meta<typeof AiChatThreadReasonBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NeedsInput: Story = { args: { reason: 'needsInput' } };
export const Mentioned: Story = { args: { reason: 'mentioned' } };
export const Assigned: Story = { args: { reason: 'assigned' } };
export const Finished: Story = { args: { reason: 'finished' } };
export const Failed: Story = { args: { reason: 'failed' } };
export const Cancelled: Story = { args: { reason: 'cancelled' } };
export const Draft: Story = { args: { reason: 'draft' } };
export const ReadOutcome: Story = {
  args: { reason: 'finished', isUnread: false },
};
