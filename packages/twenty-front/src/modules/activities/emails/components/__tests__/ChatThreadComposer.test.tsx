import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ChatThreadComposer } from '@/activities/emails/components/ChatThreadComposer';

const mockSendAppChannelMessage = jest.fn();

describe('ChatThreadComposer', () => {
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
});
