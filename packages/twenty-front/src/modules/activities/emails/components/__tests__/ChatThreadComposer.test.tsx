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

jest.mock('@/applications/components/AppChip', () => ({
  AppChip: () => null,
}));

describe('ChatThreadComposer', () => {
  it('retries a failed message with the same idempotency key', async () => {
    mockSendAppChannelMessage
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(undefined);

    const onMessageSent = jest.fn();

    render(
      <I18nProvider i18n={i18n}>
        <ChatThreadComposer
          messageThreadId="thread-id"
          messageChannelId="channel-id"
          channelName="LinkedIn"
          applicationId={null}
          recipientName="Ada"
          isDisconnected={false}
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
});
