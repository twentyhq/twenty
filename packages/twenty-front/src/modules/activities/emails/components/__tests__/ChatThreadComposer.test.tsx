import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ChatThreadComposer } from '@/activities/emails/components/ChatThreadComposer';

const mockSendAppChannelMessage = jest.fn();

jest.mock('@/activities/emails/hooks/useSendAppChannelMessage', () => ({
  useSendAppChannelMessage: () => ({
    sendAppChannelMessage: mockSendAppChannelMessage,
  }),
}));

const mockClearDraftAttachments = jest.fn();
const mockDraftAttachments = jest.fn(() => [] as unknown[]);

jest.mock('@/activities/emails/hooks/useChatThreadDraftAttachments', () => ({
  useChatThreadDraftAttachments: () => ({
    canUploadAttachments: true,
    uploadingFiles: [],
    draftAttachments: mockDraftAttachments(),
    attachFiles: jest.fn(),
    cancelUpload: jest.fn(),
    removeDraftAttachment: jest.fn(),
    clearDraftAttachments: mockClearDraftAttachments,
    openAttachmentPicker: jest.fn(),
  }),
}));

jest.mock('@/ai/components/internal/AgentChatFilePreview', () => ({
  AgentChatFilePreview: ({ file }: { file: { filename: string } }) => (
    <span>{file.filename}</span>
  ),
}));

describe('ChatThreadComposer', () => {
  afterEach(() => {
    mockSendAppChannelMessage.mockReset();
    mockDraftAttachments.mockReturnValue([]);
  });

  it('sends the uploaded attachments without any text', async () => {
    mockSendAppChannelMessage.mockResolvedValueOnce(undefined);
    mockDraftAttachments.mockReturnValue([
      {
        type: 'file',
        fileId: 'file-id',
        filename: 'offer.pdf',
        mediaType: 'application/pdf',
        url: 'https://twenty.test/offer.pdf',
      },
    ]);

    render(
      <I18nProvider i18n={i18n}>
        <ChatThreadComposer
          messageThreadId="thread-id"
          messageChannelId="channel-id"
          channelName="LinkedIn"
          recipientName="Ada"
          isDisconnected={false}
          canSendAttachments
          onMessageSent={jest.fn().mockResolvedValue(undefined)}
        />
      </I18nProvider>,
    );

    expect(screen.getByText('offer.pdf')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() =>
      expect(mockSendAppChannelMessage).toHaveBeenCalledTimes(1),
    );
    expect(mockSendAppChannelMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        text: '',
        attachments: [{ fileId: 'file-id', label: 'offer.pdf' }],
      }),
    );
    expect(mockClearDraftAttachments).toHaveBeenCalledTimes(1);
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
          canSendAttachments
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
          canSendAttachments
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
});
