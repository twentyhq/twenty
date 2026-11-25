import { act, renderHook } from '@testing-library/react';

import { useSendPendingChatMessage } from '@/activities/emails/hooks/useSendPendingChatMessage';
import { type PendingChatMessage } from '@/activities/emails/types/PendingChatMessage';

const mockSendAppChannelMessage = jest.fn();
const mockUploadEmailAttachment = jest.fn();

jest.mock('@/activities/emails/hooks/useSendAppChannelMessage', () => ({
  useSendAppChannelMessage: () => ({
    sendAppChannelMessage: mockSendAppChannelMessage,
  }),
}));

jest.mock('@/activities/emails/hooks/useUploadEmailAttachment', () => ({
  useUploadEmailAttachment: () => ({
    uploadEmailAttachment: mockUploadEmailAttachment,
  }),
}));

const deck = new File(['deck'], 'deck.pdf', { type: 'application/pdf' });

const pendingMessage: PendingChatMessage = {
  id: 'pending-message-1',
  text: '',
  files: [deck],
  status: 'sending',
};

const sendArgs = {
  messageChannelId: 'channel-1',
  messageThreadId: 'message-thread-1',
  pendingMessage,
};

describe('useSendPendingChatMessage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uploads the files once and resends the same attachments on retry', async () => {
    mockUploadEmailAttachment.mockResolvedValue({
      id: 'file-1',
      name: 'deck.pdf',
    });
    mockSendAppChannelMessage
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(null);

    const { result } = renderHook(() => useSendPendingChatMessage());

    await act(async () => {
      await expect(
        result.current.sendPendingChatMessage(sendArgs),
      ).rejects.toThrow('Network error');
    });

    await act(async () => {
      await result.current.sendPendingChatMessage(sendArgs);
    });

    expect(mockUploadEmailAttachment).toHaveBeenCalledTimes(1);
    expect(mockSendAppChannelMessage).toHaveBeenCalledTimes(2);
    expect(mockSendAppChannelMessage).toHaveBeenLastCalledWith({
      messageChannelId: 'channel-1',
      messageThreadId: 'message-thread-1',
      text: '',
      attachments: [{ id: 'file-1', name: 'deck.pdf' }],
      idempotencyKey: 'pending-message-1',
    });
  });

  it('only uploads the failed files again on retry', async () => {
    const photo = new File(['photo'], 'photo.png', { type: 'image/png' });
    const pendingMessageWithTwoFiles: PendingChatMessage = {
      ...pendingMessage,
      files: [deck, photo],
    };

    mockUploadEmailAttachment.mockImplementation(async (file: File) =>
      file === deck ? { id: 'file-1', name: 'deck.pdf' } : null,
    );
    mockSendAppChannelMessage.mockResolvedValue(null);

    const { result } = renderHook(() => useSendPendingChatMessage());

    await act(async () => {
      await expect(
        result.current.sendPendingChatMessage({
          ...sendArgs,
          pendingMessage: pendingMessageWithTwoFiles,
        }),
      ).rejects.toThrow();
    });

    mockUploadEmailAttachment.mockResolvedValueOnce({
      id: 'file-2',
      name: 'photo.png',
    });

    await act(async () => {
      await result.current.sendPendingChatMessage({
        ...sendArgs,
        pendingMessage: pendingMessageWithTwoFiles,
      });
    });

    expect(mockUploadEmailAttachment).toHaveBeenCalledTimes(3);
    expect(mockUploadEmailAttachment).toHaveBeenLastCalledWith(photo);
    expect(mockSendAppChannelMessage).toHaveBeenCalledTimes(1);
    expect(mockSendAppChannelMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        attachments: [
          { id: 'file-1', name: 'deck.pdf' },
          { id: 'file-2', name: 'photo.png' },
        ],
      }),
    );
  });

  it('does not send when a file fails to upload', async () => {
    mockUploadEmailAttachment.mockResolvedValue(null);

    const { result } = renderHook(() => useSendPendingChatMessage());

    await act(async () => {
      await expect(
        result.current.sendPendingChatMessage(sendArgs),
      ).rejects.toThrow();
    });

    expect(mockSendAppChannelMessage).not.toHaveBeenCalled();
  });
});
