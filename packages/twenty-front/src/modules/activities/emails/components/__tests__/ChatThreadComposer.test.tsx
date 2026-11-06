import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ChatThreadComposer } from '@/activities/emails/components/ChatThreadComposer';

const mockSendAppChannelMessage = jest.fn();
const mockOpenAttachmentPicker = jest.fn();

jest.mock('@/activities/emails/hooks/useSendAppChannelMessage', () => ({
  useSendAppChannelMessage: () => ({
    sendAppChannelMessage: mockSendAppChannelMessage,
  }),
}));

jest.mock('@/file/components/AttachmentChip', () => ({
  AttachmentChip: ({ file }: { file: { name: string } }) => (
    <span>{file.name}</span>
  ),
}));

jest.mock('@/activities/emails/hooks/useAttachEmailFiles', () => ({
  useAttachEmailFiles: ({
    onFilesAttached,
  }: {
    onFilesAttached: (files: { id: string; name: string }[]) => void;
  }) => ({
    openAttachmentPicker: () => mockOpenAttachmentPicker(onFilesAttached),
    isUploadingAttachments: false,
  }),
}));

describe('ChatThreadComposer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retries a failed message with the same idempotency key', async () => {
    mockSendAppChannelMessage
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(undefined);

    const onMessageSent = jest.fn().mockResolvedValue(undefined);

    render(
      <I18nProvider i18n={i18n}>
        <ChatThreadComposer
          messageThreadId="thread-id"
          messageChannelId="channel-id"
          channelName="LinkedIn"
          recipientName="Ada"
          isDisconnected={false}
          canAttachFiles={false}
          onMessageSent={onMessageSent}
        />
      </I18nProvider>,
    );

    await userEvent.type(screen.getByRole('textbox'), 'Hello{Enter}');
    await userEvent.click(await screen.findByRole('button', { name: 'Retry' }));

    await waitFor(() => expect(onMessageSent).toHaveBeenCalledTimes(1));

    const [firstCall, secondCall] = mockSendAppChannelMessage.mock.calls;

    expect(firstCall[0].idempotencyKey).toEqual(expect.any(String));
    expect(secondCall[0].idempotencyKey).toBe(firstCall[0].idempotencyKey);
  });

  it('keeps the sent message until the thread is refreshed', async () => {
    mockSendAppChannelMessage.mockResolvedValueOnce(undefined);

    let finishRefresh: () => void = () => undefined;
    const onMessageSent = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          finishRefresh = resolve;
        }),
    );

    render(
      <I18nProvider i18n={i18n}>
        <ChatThreadComposer
          messageThreadId="thread-id"
          messageChannelId="channel-id"
          channelName="LinkedIn"
          recipientName="Ada"
          isDisconnected={false}
          canAttachFiles={false}
          onMessageSent={onMessageSent}
        />
      </I18nProvider>,
    );

    await userEvent.type(screen.getByRole('textbox'), 'Hello{Enter}');
    await waitFor(() => expect(onMessageSent).toHaveBeenCalledTimes(1));

    expect(screen.getByText('Hello')).toBeInTheDocument();

    finishRefresh();

    await waitFor(() =>
      expect(screen.queryByText('Hello')).not.toBeInTheDocument(),
    );
  });

  it('sends attached files without text and keeps them on retry', async () => {
    mockOpenAttachmentPicker.mockImplementation((onFilesAttached) =>
      onFilesAttached([{ id: 'file-id', name: 'deck.pdf' }]),
    );
    mockSendAppChannelMessage
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(undefined);

    const onMessageSent = jest.fn().mockResolvedValue(undefined);

    render(
      <I18nProvider i18n={i18n}>
        <ChatThreadComposer
          messageThreadId="thread-id"
          messageChannelId="channel-id"
          channelName="LinkedIn"
          recipientName="Ada"
          isDisconnected={false}
          canAttachFiles
          onMessageSent={onMessageSent}
        />
      </I18nProvider>,
    );

    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();

    await userEvent.click(screen.getByRole('button', { name: 'Attach files' }));

    expect(screen.getByText('deck.pdf')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Send' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Retry' }));

    await waitFor(() => expect(onMessageSent).toHaveBeenCalledTimes(1));

    const [firstCall, secondCall] = mockSendAppChannelMessage.mock.calls;

    expect(firstCall[0]).toMatchObject({
      text: '',
      attachments: [{ id: 'file-id', name: 'deck.pdf' }],
    });
    expect(secondCall[0].attachments).toEqual(firstCall[0].attachments);
  });

  it('hides the attach button when attachments are unavailable', () => {
    render(
      <I18nProvider i18n={i18n}>
        <ChatThreadComposer
          messageThreadId="thread-id"
          messageChannelId="channel-id"
          channelName="LinkedIn"
          recipientName="Ada"
          isDisconnected={false}
          canAttachFiles={false}
          onMessageSent={jest.fn()}
        />
      </I18nProvider>,
    );

    expect(
      screen.queryByRole('button', { name: 'Attach files' }),
    ).not.toBeInTheDocument();
  });
});
