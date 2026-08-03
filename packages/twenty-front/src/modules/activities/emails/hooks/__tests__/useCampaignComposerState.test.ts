import { act, renderHook, waitFor } from '@testing-library/react';

import { useCampaignComposerState } from '@/activities/emails/hooks/useCampaignComposerState';
import { useMessageCampaignDraft } from '@/activities/emails/hooks/useMessageCampaignDraft';
import { useSendMessageCampaign } from '@/activities/emails/hooks/useSendMessageCampaign';

jest.mock('@/activities/emails/hooks/useSendMessageCampaign');
jest.mock('@/activities/emails/hooks/useMessageCampaignDraft');

const sendMessageCampaignMock = jest.fn(
  (): Promise<boolean> => Promise.resolve(true),
);

const mockedUseSendMessageCampaign = jest.mocked(useSendMessageCampaign);
const mockedUseMessageCampaignDraft = jest.mocked(useMessageCampaignDraft);
const saveDraftMock = jest.fn(() =>
  Promise.resolve({ campaignId: 'campaign-1', updatedAt: '2026-07-31' }),
);

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
    mockedUseMessageCampaignDraft.mockReturnValue({
      saveDraft: saveDraftMock,
      deleteDraft: jest.fn(),
      isSaving: false,
      isDeleting: false,
    });
  });

  it('should start empty and not be sendable', () => {
    const { result } = renderHook(() =>
      useCampaignComposerState({ autoSaveDraft: false }),
    );

    expect(result.current.listId).toBeNull();
    expect(result.current.unsubscribeTopicId).toBeNull();
    expect(result.current.canSend).toBe(false);
  });

  it('should become sendable once list, from address and subject are set', () => {
    const { result } = renderHook(() =>
      useCampaignComposerState({ autoSaveDraft: false }),
    );

    fillSendableFields(result);

    expect(result.current.canSend).toBe(true);
  });

  it('should not be sendable while a send is in flight', () => {
    mockedUseSendMessageCampaign.mockReturnValue({
      sendMessageCampaign: sendMessageCampaignMock,
      loading: true,
    });

    const { result } = renderHook(() =>
      useCampaignComposerState({ autoSaveDraft: false }),
    );

    fillSendableFields(result);

    expect(result.current.canSend).toBe(false);
  });

  it('should send the existing draft and call onSent on success', async () => {
    sendMessageCampaignMock.mockResolvedValue(true);
    const onSent = jest.fn();

    const { result } = renderHook(() =>
      useCampaignComposerState({
        campaignId: 'campaign-1',
        onSent,
        autoSaveDraft: false,
      }),
    );

    fillSendableFields(result);

    await act(async () => {
      await result.current.handleSend();
    });

    expect(sendMessageCampaignMock).toHaveBeenCalledWith({
      campaignId: 'campaign-1',
    });
    expect(onSent).toHaveBeenCalledTimes(1);
  });

  it('should persist the current values as a draft before sending', async () => {
    sendMessageCampaignMock.mockResolvedValue(true);

    const { result } = renderHook(() => useCampaignComposerState({}));

    await waitFor(() => {
      expect(result.current.draftCampaignId).toBe('campaign-1');
    });

    act(() => {
      result.current.setUnsubscribeTopicId('topic-1');
      result.current.setBody('Body');
    });
    fillSendableFields(result);

    await act(async () => {
      await result.current.handleSend();
    });

    expect(saveDraftMock).toHaveBeenLastCalledWith({
      campaignId: 'campaign-1',
      listId: 'list-1',
      unsubscribeTopicId: 'topic-1',
      subject: 'Hello',
      body: 'Body',
      fromAddress: 'sender@example.com',
    });
    expect(sendMessageCampaignMock).toHaveBeenCalledWith({
      campaignId: 'campaign-1',
    });
  });

  it('should not send when required fields are missing', async () => {
    const { result } = renderHook(() =>
      useCampaignComposerState({
        campaignId: 'campaign-1',
        autoSaveDraft: false,
      }),
    );

    await act(async () => {
      await result.current.handleSend();
    });

    expect(sendMessageCampaignMock).not.toHaveBeenCalled();
  });

  it('should not send when no draft exists yet', async () => {
    const { result } = renderHook(() =>
      useCampaignComposerState({ autoSaveDraft: false }),
    );

    fillSendableFields(result);

    await act(async () => {
      await result.current.handleSend();
    });

    expect(sendMessageCampaignMock).not.toHaveBeenCalled();
  });

  it('should not call onSent when the send fails', async () => {
    sendMessageCampaignMock.mockResolvedValue(false);
    const onSent = jest.fn();

    const { result } = renderHook(() =>
      useCampaignComposerState({
        campaignId: 'campaign-1',
        onSent,
        autoSaveDraft: false,
      }),
    );

    fillSendableFields(result);

    await act(async () => {
      await result.current.handleSend();
    });

    expect(sendMessageCampaignMock).toHaveBeenCalled();
    expect(onSent).not.toHaveBeenCalled();
  });

  it('creates a draft when the composer opens', async () => {
    const { result } = renderHook(() => useCampaignComposerState({}));

    await waitFor(() => {
      expect(result.current.draftCampaignId).toBe('campaign-1');
    });

    expect(saveDraftMock).toHaveBeenCalledWith({
      campaignId: undefined,
      listId: null,
      unsubscribeTopicId: null,
      subject: '',
      body: '',
      fromAddress: null,
    });
  });
});
