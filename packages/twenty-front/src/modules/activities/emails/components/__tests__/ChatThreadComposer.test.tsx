import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ChatThreadComposer } from '@/activities/emails/components/ChatThreadComposer';

const mockSendAppChannelMessage = jest.fn();
const mockEnqueueToast = jest.fn();

jest.mock('twenty-ui/components/feedback', () => ({
  ...jest.requireActual('twenty-ui/components/feedback'),
  useToast: () => ({ enqueueToast: mockEnqueueToast }),
}));

jest.mock('@/ai/components/internal/AgentChatFilePreview', () => ({
  AgentChatFilePreview: ({ file }: { file: File }) => <span>{file.name}</span>,
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

  it('sends attached files without text and keeps them on retry', async () => {
    mockSendAppChannelMessage
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(undefined);

    const onMessageSent = jest.fn().mockResolvedValue(undefined);
    const deck = new File(['deck'], 'deck.pdf', { type: 'application/pdf' });

    const { container } = render(
      <I18nProvider i18n={i18n}>
        <ChatThreadComposer
          channelName="LinkedIn"
          recipientName="Ada"
          isDisconnected={false}
          canAttachFiles
          onSendMessage={mockSendAppChannelMessage}
          onMessageSent={onMessageSent}
        />
      </I18nProvider>,
    );

    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();

    const fileInput = container.querySelector('input[type="file"]');

    if (!(fileInput instanceof HTMLInputElement)) {
      throw new Error('The composer file input is missing');
    }

    await userEvent.upload(fileInput, deck);

    expect(screen.getByText('deck.pdf')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Send' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Retry' }));

    await waitFor(() => expect(onMessageSent).toHaveBeenCalledTimes(1));

    const [firstCall, secondCall] = mockSendAppChannelMessage.mock.calls;

    expect(firstCall[0].text).toBe('');
    expect(firstCall[0].files).toHaveLength(1);
    expect(firstCall[0].files[0]).toBe(deck);
    expect(secondCall[0].id).toBe(firstCall[0].id);
    expect(secondCall[0].files[0]).toBe(deck);
  });

  it('keeps at most 20 files on a message and warns about the extra ones', async () => {
    const { container } = render(
      <I18nProvider i18n={i18n}>
        <ChatThreadComposer
          channelName="LinkedIn"
          recipientName="Ada"
          isDisconnected={false}
          canAttachFiles
          onSendMessage={mockSendAppChannelMessage}
          onMessageSent={jest.fn()}
        />
      </I18nProvider>,
    );

    const fileInput = container.querySelector('input[type="file"]');

    if (!(fileInput instanceof HTMLInputElement)) {
      throw new Error('The composer file input is missing');
    }

    await userEvent.upload(
      fileInput,
      Array.from(
        { length: 21 },
        (_value, index) => new File(['file'], `file-${index}.pdf`),
      ),
    );

    expect(screen.getByText('file-19.pdf')).toBeInTheDocument();
    expect(screen.queryByText('file-20.pdf')).not.toBeInTheDocument();
    expect(mockEnqueueToast).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'error' }),
    );
  });
});
