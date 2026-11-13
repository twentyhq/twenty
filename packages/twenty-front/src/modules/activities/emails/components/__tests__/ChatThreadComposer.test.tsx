import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ChatThreadComposer } from '@/activities/emails/components/ChatThreadComposer';

const mockSendAppChannelMessage = jest.fn();

describe('ChatThreadComposer', () => {
  beforeEach(() => {
    mockSendAppChannelMessage.mockReset();
    sessionStorage.clear();
  });

  it('retries a failed message with the same idempotency key', async () => {
    mockSendAppChannelMessage
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(undefined);

    const onMessageSent = jest.fn().mockResolvedValue(undefined);

    render(
      <I18nProvider i18n={i18n}>
        <ChatThreadComposer
          channelName="LinkedIn"
          recipientName="Ada"
          isDisconnected={false}
          onSendMessage={mockSendAppChannelMessage}
          onMessageSent={onMessageSent}
        />
      </I18nProvider>,
    );

    await userEvent.type(screen.getByRole('textbox'), 'Hello{Enter}');
    await userEvent.click(await screen.findByRole('button', { name: 'Retry' }));

    await waitFor(() => expect(onMessageSent).toHaveBeenCalledTimes(1));

    const [firstCall, secondCall] = mockSendAppChannelMessage.mock.calls;

    expect(firstCall[0].id).toEqual(expect.any(String));
    expect(secondCall[0].id).toBe(firstCall[0].id);
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
          channelName="LinkedIn"
          recipientName="Ada"
          isDisconnected={false}
          onSendMessage={mockSendAppChannelMessage}
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

  it('explains why a message failed and only discards the local copy', async () => {
    mockSendAppChannelMessage.mockRejectedValueOnce(
      new Error('LinkedIn rejected the message'),
    );

    render(
      <I18nProvider i18n={i18n}>
        <ChatThreadComposer
          channelName="LinkedIn"
          recipientName="Ada"
          isDisconnected={false}
          onSendMessage={mockSendAppChannelMessage}
          onMessageSent={jest.fn()}
        />
      </I18nProvider>,
    );

    await userEvent.type(screen.getByRole('textbox'), 'Hello{Enter}');
    await userEvent.hover(await screen.findByText('Sending failed'));

    expect(
      await screen.findByText('LinkedIn rejected the message'),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(screen.queryByText('Hello')).not.toBeInTheDocument();
    expect(mockSendAppChannelMessage).toHaveBeenCalledTimes(1);
  });

  it('keeps the draft and blocks retries while the channel is disconnected', async () => {
    mockSendAppChannelMessage.mockRejectedValueOnce(new Error('Unauthorized'));

    const renderComposer = (isDisconnected: boolean) => (
      <I18nProvider i18n={i18n}>
        <ChatThreadComposer
          channelName="WhatsApp"
          recipientName="Ada"
          isDisconnected={isDisconnected}
          onSendMessage={mockSendAppChannelMessage}
          onMessageSent={jest.fn()}
          draftKey="thread-1"
        />
      </I18nProvider>
    );

    const { rerender } = render(renderComposer(false));

    await userEvent.type(screen.getByRole('textbox'), 'Hello{Enter}');
    await screen.findByText('Sending failed');
    await userEvent.type(screen.getByRole('textbox'), 'Draft reply');

    rerender(renderComposer(true));

    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('textbox')).toHaveValue('Draft reply');
    expect(
      screen.getByPlaceholderText('Reconnect WhatsApp to send messages'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
  });

  it('restores the draft of a thread after the page reloads', async () => {
    const renderComposer = () =>
      render(
        <I18nProvider i18n={i18n}>
          <ChatThreadComposer
            channelName="WhatsApp"
            recipientName="Ada"
            isDisconnected={false}
            onSendMessage={mockSendAppChannelMessage}
            onMessageSent={jest.fn()}
            draftKey="thread-2"
          />
        </I18nProvider>,
      );

    const { unmount } = renderComposer();

    await userEvent.type(screen.getByRole('textbox'), 'Before reconnecting');
    unmount();

    renderComposer();

    expect(screen.getByRole('textbox')).toHaveValue('Before reconnecting');
    expect(
      sessionStorage.getItem(
        'activities/chatThreadComposerDraftFamilyState__thread-2',
      ),
    ).toBe(JSON.stringify('Before reconnecting'));
  });
});
