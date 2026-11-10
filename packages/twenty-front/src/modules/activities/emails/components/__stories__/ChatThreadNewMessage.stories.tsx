import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { ChatThreadNewMessage } from '@/activities/emails/components/ChatThreadNewMessage';
import { type ChatThreadRecipient } from '@/activities/emails/types/ChatThreadRecipient';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';

const RECIPIENTS: ChatThreadRecipient[] = [
  { id: 'sundar', name: 'Sundar Pichai' },
  { id: 'thomas', name: 'Thomas Kurian' },
];

const onSendMessage = fn(() => Promise.resolve());
const onMessageSent = fn(() => new Promise(() => undefined));

const ChatThreadNewMessageStory = () => {
  const [recipients, setRecipients] = useState(RECIPIENTS);

  return (
    <ChatThreadNewMessage
      recipients={recipients}
      onRecipientRemove={(recipientId) =>
        setRecipients((currentRecipients) =>
          currentRecipients.filter(({ id }) => id !== recipientId),
        )
      }
      channelName="WhatsApp"
      onSendMessage={onSendMessage}
      onMessageSent={onMessageSent}
      canAttachFiles
    />
  );
};

const meta: Meta<typeof ChatThreadNewMessageStory> = {
  title: 'Modules/Activities/Emails/ChatThreadNewMessage',
  component: ChatThreadNewMessageStory,
  decorators: [ComponentDecorator, ObjectMetadataItemsDecorator],
  parameters: { container: { width: 400, height: 400 } },
  beforeEach: () => {
    onSendMessage.mockClear();
  },
};

export default meta;
type Story = StoryObj<typeof ChatThreadNewMessageStory>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const recipients = await canvas.findByRole('group', { name: 'Recipients' });

    const recipientRemoval = within(recipients).getByRole('button', {
      name: 'Remove Thomas Kurian',
    });

    recipientRemoval.focus();
    await userEvent.click(recipientRemoval);
    await expect(
      within(recipients).queryByText('Thomas Kurian'),
    ).not.toBeInTheDocument();
    await expect(recipients).toHaveFocus();

    await userEvent.type(
      canvas.getByPlaceholderText('Message Sundar Pichai'),
      'Hello{Enter}',
    );
    await waitFor(() => expect(onSendMessage).toHaveBeenCalledTimes(1));
    await expect(onSendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ text: 'Hello', files: [] }),
    );
  },
};

export const NoRecipients: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const recipients = await canvas.findByRole('group', { name: 'Recipients' });

    for (const name of ['Sundar Pichai', 'Thomas Kurian']) {
      const recipientRemoval = within(recipients).getByRole('button', {
        name: `Remove ${name}`,
      });

      recipientRemoval.focus();
      await userEvent.click(recipientRemoval);
    }

    const textbox = canvas.getByRole('textbox');

    await userEvent.type(textbox, 'Hello{Enter}');
    await expect(canvas.getByRole('button', { name: 'Send' })).toBeDisabled();
    await expect(textbox).toHaveValue('Hello');
    await expect(onSendMessage).not.toHaveBeenCalled();
  },
};

export const FailedSendWithoutRecipients: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const recipients = await canvas.findByRole('group', { name: 'Recipients' });

    onSendMessage.mockImplementationOnce(() => Promise.reject(new Error()));
    await userEvent.type(canvas.getByRole('textbox'), 'Hello{Enter}');
    await canvas.findByText('Sending failed');

    for (const name of ['Sundar Pichai', 'Thomas Kurian']) {
      const recipientRemoval = within(recipients).getByRole('button', {
        name: `Remove ${name}`,
      });

      recipientRemoval.focus();
      await userEvent.click(recipientRemoval);
    }

    await expect(canvas.getByRole('button', { name: 'Retry' })).toBeDisabled();
    await expect(onSendMessage).toHaveBeenCalledTimes(1);
  },
};
