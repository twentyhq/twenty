import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type Dispatch, type SetStateAction } from 'react';
import { type EmailAttachment } from 'twenty-shared/types';

import { ChatThreadComposer } from '@/activities/emails/components/ChatThreadComposer';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const mockSendAppChannelMessage = jest.fn();

jest.mock('@/activities/emails/hooks/useSendAppChannelMessage', () => ({
  useSendAppChannelMessage: () => ({
    sendAppChannelMessage: mockSendAppChannelMessage,
  }),
}));

let mockAttachedFiles: EmailAttachment[] = [];

jest.mock('@/activities/emails/hooks/useAttachChatFiles', () => ({
  useAttachChatFiles: ({
    onFilesAttached,
  }: {
    onFilesAttached: Dispatch<SetStateAction<EmailAttachment[]>>;
  }) => ({
    openAttachmentPicker: () =>
      onFilesAttached((files) => [...files, ...mockAttachedFiles]),
    isUploadingAttachments: false,
  }),
}));

jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: () => true,
}));

const renderComposer = (onMessageSent: () => Promise<unknown>) =>
  render(
    <I18nProvider i18n={i18n}>
      <ChatThreadComposer
        messageThreadId="thread-id"
        messageChannelId="channel-id"
        channelName="LinkedIn"
        recipientName="Ada"
        isDisconnected={false}
        onMessageSent={onMessageSent}
      />
    </I18nProvider>,
    { wrapper: getJestMetadataAndApolloMocksWrapper({}) },
  );

describe('ChatThreadComposer', () => {
  beforeEach(() => {
    mockSendAppChannelMessage.mockReset();
    mockAttachedFiles = [];
  });

  it('sends attached files without requiring a text', async () => {
    mockSendAppChannelMessage.mockResolvedValueOnce(undefined);
    mockAttachedFiles = [{ id: 'file-id', name: 'quote.pdf' }];

    renderComposer(jest.fn().mockResolvedValue(undefined));

    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();

    await userEvent.click(screen.getByRole('button', { name: 'Attach files' }));

    expect(screen.getByText('quote.pdf')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() =>
      expect(mockSendAppChannelMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          text: '',
          attachments: [{ id: 'file-id', name: 'quote.pdf' }],
        }),
      ),
    );
  });

  it('sends without a file removed from the draft', async () => {
    mockSendAppChannelMessage.mockResolvedValueOnce(undefined);
    mockAttachedFiles = [{ id: 'file-id', name: 'quote.pdf' }];

    renderComposer(jest.fn().mockResolvedValue(undefined));

    await userEvent.click(screen.getByRole('button', { name: 'Attach files' }));
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove quote.pdf' }),
    );
    await userEvent.type(screen.getByRole('textbox'), 'Hello{Enter}');

    await waitFor(() =>
      expect(mockSendAppChannelMessage).toHaveBeenCalledWith(
        expect.objectContaining({ text: 'Hello', attachments: [] }),
      ),
    );
  });

  it('retries a failed message with the same idempotency key', async () => {
    mockSendAppChannelMessage
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(undefined);

    const onMessageSent = jest.fn().mockResolvedValue(undefined);

    renderComposer(onMessageSent);

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

    renderComposer(onMessageSent);

    await userEvent.type(screen.getByRole('textbox'), 'Hello{Enter}');
    await waitFor(() => expect(onMessageSent).toHaveBeenCalledTimes(1));

    expect(screen.getByText('Hello')).toBeInTheDocument();

    finishRefresh();

    await waitFor(() =>
      expect(screen.queryByText('Hello')).not.toBeInTheDocument(),
    );
  });
});
