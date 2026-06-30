import { act, renderHook } from '@testing-library/react';

import { useCampaignComposerState } from '@/activities/emails/hooks/useCampaignComposerState';
import { useSendMessageCampaign } from '@/activities/emails/hooks/useSendMessageCampaign';

jest.mock('@/activities/emails/hooks/useSendMessageCampaign');

const sendMessageCampaignMock = jest.fn(
  (): Promise<boolean> => Promise.resolve(true),
);

const mockedUseSendMessageCampaign = jest.mocked(useSendMessageCampaign);

const fillSendableFields = (result: {
  current: ReturnType<typeof useCampaignComposerState>;
}) => {
  act(() => {
    result.current.setListId('list-1');
    result.current.setFromAddress('  sender@example.com  ');
    result.current.setSubject('Hello');
  });
};

describe('useCampaignComposerState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseSendMessageCampaign.mockReturnValue({
      sendMessageCampaign: sendMessageCampaignMock,
      loading: false,
    });
  });

  it('should start empty and not be sendable', () => {
    const { result } = renderHook(() => useCampaignComposerState({}));

    expect(result.current.listId).toBeNull();
    expect(result.current.unsubscribeTopicId).toBeNull();
    expect(result.current.canSend).toBe(false);
  });

  it('should become sendable once list, from address and subject are set', () => {
    const { result } = renderHook(() => useCampaignComposerState({}));

    fillSendableFields(result);

    expect(result.current.canSend).toBe(true);
  });

  it('should not be sendable while a send is in flight', () => {
    mockedUseSendMessageCampaign.mockReturnValue({
      sendMessageCampaign: sendMessageCampaignMock,
      loading: true,
    });

    const { result } = renderHook(() => useCampaignComposerState({}));

    fillSendableFields(result);

    expect(result.current.canSend).toBe(false);
  });

  it('should send trimmed values with the selected topic and call onSent on success', async () => {
    sendMessageCampaignMock.mockResolvedValue(true);
    const onSent = jest.fn();

    const { result } = renderHook(() => useCampaignComposerState({ onSent }));

    act(() => {
      result.current.setUnsubscribeTopicId('topic-1');
      result.current.setBody('Body');
    });
    fillSendableFields(result);

    await act(async () => {
      await result.current.handleSend();
    });

    expect(sendMessageCampaignMock).toHaveBeenCalledWith({
      listId: 'list-1',
      unsubscribeTopicId: 'topic-1',
      subject: 'Hello',
      body: 'Body',
      fromAddress: 'sender@example.com',
    });
    expect(onSent).toHaveBeenCalledTimes(1);
  });

  it('should pass an undefined topic when none is selected', async () => {
    sendMessageCampaignMock.mockResolvedValue(true);

    const { result } = renderHook(() => useCampaignComposerState({}));

    fillSendableFields(result);

    await act(async () => {
      await result.current.handleSend();
    });

    expect(sendMessageCampaignMock).toHaveBeenCalledWith(
      expect.objectContaining({ unsubscribeTopicId: undefined }),
    );
  });

  it('should not send when required fields are missing', async () => {
    const { result } = renderHook(() => useCampaignComposerState({}));

    await act(async () => {
      await result.current.handleSend();
    });

    expect(sendMessageCampaignMock).not.toHaveBeenCalled();
  });

  it('should not call onSent when the send fails', async () => {
    sendMessageCampaignMock.mockResolvedValue(false);
    const onSent = jest.fn();

    const { result } = renderHook(() => useCampaignComposerState({ onSent }));

    fillSendableFields(result);

    await act(async () => {
      await result.current.handleSend();
    });

    expect(sendMessageCampaignMock).toHaveBeenCalled();
    expect(onSent).not.toHaveBeenCalled();
  });
});
