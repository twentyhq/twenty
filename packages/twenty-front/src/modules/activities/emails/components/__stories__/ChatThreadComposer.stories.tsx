import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { ChatThreadComposer } from '@/activities/emails/components/ChatThreadComposer';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const onSendMessage = fn(() => Promise.resolve());
const onMessageSent = fn(() => new Promise(() => undefined));

const meta: Meta<typeof ChatThreadComposer> = {
  title: 'Modules/Activities/Emails/ChatThreadComposer',
  component: ChatThreadComposer,
  decorators: [
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    ToastDecorator,
  ],
  parameters: { container: { width: 400 } },
  args: {
    channelName: 'WhatsApp',
    recipientName: 'Sundar',
    isDisconnected: false,
    onSendMessage,
    onMessageSent,
  },
  beforeEach: () => {
    onSendMessage.mockClear();
    onSendMessage.mockImplementation(() => Promise.resolve());
  },
};

export default meta;
type Story = StoryObj<typeof ChatThreadComposer>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole('button', { name: 'Send' }),
    ).toBeDisabled();
    await expect(
      canvas.queryByRole('button', { name: 'Attach files' }),
    ).not.toBeInTheDocument();
  },
};

export const Attachments: Story = {
  args: { canAttachFiles: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByRole('button', { name: 'Attach files' });

    const fileInput = canvasElement.querySelector('input[type="file"]');

    if (!(fileInput instanceof HTMLInputElement)) {
      throw new Error('The composer file input is missing');
    }

    const signedPage = new File(['signed'], 'signed-page.pdf', {
      type: 'application/pdf',
    });
    const draftPage = new File(['draft'], 'draft-page.pdf', {
      type: 'application/pdf',
    });

    await userEvent.upload(fileInput, [signedPage, draftPage]);
    await userEvent.click(
      await canvas.findByRole('button', { name: /Remove draft-page/ }),
    );
    await expect(canvas.queryByText(/draft-page/)).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Send' }));
    await waitFor(() => expect(onSendMessage).toHaveBeenCalledTimes(1));
    await expect(onSendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ text: '', files: [signedPage] }),
    );
  },
};

export const SendingFailed: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    onSendMessage.mockImplementation(() =>
      Promise.reject(new Error('WhatsApp rejected the message')),
    );

    await userEvent.type(
      await canvas.findByRole('textbox'),
      'Signed copy attached, sending now.{Enter}',
    );
    await expect(await canvas.findByText('Sending failed')).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Retry' })).toBeVisible();

    await userEvent.hover(canvas.getByText('Sending failed'));
    await expect(
      await within(document.body).findByText('WhatsApp rejected the message'),
    ).toBeVisible();
  },
};

export const Disconnected: Story = {
  args: { isDisconnected: true, canAttachFiles: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('textbox')).toBeDisabled();
    await expect(
      canvas.getByRole('button', { name: 'Attach files' }),
    ).toBeDisabled();
  },
};

export const DisconnectedKeepsDraft: Story = {
  args: { isDisconnected: true, draftKey: 'chat-thread-composer-story' },
  beforeEach: () => {
    sessionStorage.setItem(
      'activities/chatThreadComposerDraftFamilyState__chat-thread-composer-story',
      JSON.stringify('Signed copy attached, sending now.'),
    );

    return () => sessionStorage.clear();
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textbox = await canvas.findByRole('textbox');

    await expect(textbox).toBeDisabled();
    await expect(textbox).toHaveValue('Signed copy attached, sending now.');
    await expect(canvas.getByRole('button', { name: 'Send' })).toBeDisabled();
  },
};
