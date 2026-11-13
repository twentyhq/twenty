import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from 'twenty-ui/primitives/input';
import { ComponentDecorator } from 'twenty-ui/testing';

import { InboxTypingIndicator } from '@/ai/components/InboxTypingIndicator';

const meta: Meta<typeof InboxTypingIndicator> = {
  title: 'Modules/AI/AiChatTypingIndicator',
  component: InboxTypingIndicator,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 400 } },
};

export default meta;
type Story = StoryObj<typeof InboxTypingIndicator>;

export const OneParticipant: Story = {
  args: { participants: [{ id: 'sarah', name: 'Sarah' }] },
};

export const MultipleParticipants: Story = {
  args: {
    participants: [
      { id: 'sarah', name: 'Sarah' },
      { id: 'marco', name: 'Marco' },
    ],
  },
};

export const Empty: Story = {
  args: { participants: [] },
};

const TypingEndsFixture = () => {
  const [participants, setParticipants] = useState([
    { id: 'sarah', name: 'Sarah' },
  ]);

  return (
    <>
      <InboxTypingIndicator participants={participants} />
      <Button onClick={() => setParticipants([])}>Stop typing</Button>
    </>
  );
};

export const TypingEnds: Story = {
  render: () => <TypingEndsFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Sarah is typing…',
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Stop typing' }));
    await expect(canvas.queryByRole('status')).not.toBeInTheDocument();
  },
};
