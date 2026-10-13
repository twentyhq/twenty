import { act, renderHook } from '@testing-library/react';

import { PREVIEW_MESSAGE_CAMPAIGN_SEND } from '@/activities/emails/graphql/metadata-queries/previewMessageCampaignSend';
import { usePersistedCampaignDraft } from '@/activities/emails/hooks/usePersistedCampaignDraft';

const mockUpdateOneRecord = jest.fn().mockResolvedValue({});

jest.mock('@/object-record/hooks/useUpdateOneRecord', () => ({
  useUpdateOneRecord: () => ({ updateOneRecord: mockUpdateOneRecord }),
}));

const mockRefetchQueries = jest.fn().mockResolvedValue([]);

jest.mock('@apollo/client/react', () => ({
  useApolloClient: () => ({ refetchQueries: mockRefetchQueries }),
}));

const mockEnqueueToast = jest.fn();

jest.mock('twenty-ui/components/feedback', () => ({
  ...jest.requireActual('twenty-ui/components/feedback'),
  useToast: () => ({ enqueueToast: mockEnqueueToast }),
}));

const campaignId = '20202020-0000-4000-8000-000000000001';

const renderDraftHook = (initialSubject: string) =>
  renderHook(
    ({ subject }: { subject: string }) =>
      usePersistedCampaignDraft({
        campaignId,
        initialDraft: () => ({ subject }),
        toUpdateOneRecordInput: (draft) => draft,
      }),
    { initialProps: { subject: initialSubject } },
  );

describe('usePersistedCampaignDraft', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should adopt a remote change when the draft is pristine', () => {
    const { result, rerender } = renderDraftHook('');

    const initialResyncKey = result.current.draftResyncKey;

    rerender({ subject: 'Written by the AI' });

    expect(result.current.draft.subject).toBe('Written by the AI');
    expect(result.current.draftResyncKey).not.toBe(initialResyncKey);
  });

  it('should keep the local draft when its own persist echoes back', () => {
    const { result, rerender } = renderDraftHook('');

    act(() => {
      result.current.updateDraft({ subject: 'Typed locally' });
    });

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(mockUpdateOneRecord).toHaveBeenCalledWith({
      objectNameSingular: 'messageCampaign',
      idToUpdate: campaignId,
      updateOneRecordInput: { subject: 'Typed locally' },
    });

    const resyncKeyBeforeEcho = result.current.draftResyncKey;

    rerender({ subject: 'Typed locally' });

    expect(result.current.draft.subject).toBe('Typed locally');
    expect(result.current.draftResyncKey).toBe(resyncKeyBeforeEcho);
  });

  it('should refresh the send preview once a save lands, and not when it fails', async () => {
    const { result } = renderDraftHook('');

    act(() => {
      result.current.updateDraft({ subject: 'Typed locally' });
    });

    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    expect(mockRefetchQueries).toHaveBeenCalledTimes(1);
    expect(mockRefetchQueries).toHaveBeenCalledWith({
      include: [PREVIEW_MESSAGE_CAMPAIGN_SEND],
    });

    mockRefetchQueries.mockClear();
    mockUpdateOneRecord.mockRejectedValueOnce(new Error('Save failed'));

    act(() => {
      result.current.updateDraft({ subject: 'Typed again' });
    });

    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    expect(mockRefetchQueries).not.toHaveBeenCalled();
    expect(mockEnqueueToast).toHaveBeenCalledTimes(1);
    expect(mockEnqueueToast).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'error' }),
    );
  });

  it('should let unsaved local edits win over a concurrent remote change', () => {
    const { result, rerender } = renderDraftHook('');

    act(() => {
      result.current.updateDraft({ subject: 'Typed locally' });
    });

    const resyncKeyBeforeRemoteChange = result.current.draftResyncKey;

    rerender({ subject: 'Concurrent remote change' });

    expect(result.current.draft.subject).toBe('Typed locally');
    expect(result.current.draftResyncKey).toBe(resyncKeyBeforeRemoteChange);

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(mockUpdateOneRecord).toHaveBeenCalledWith({
      objectNameSingular: 'messageCampaign',
      idToUpdate: campaignId,
      updateOneRecordInput: { subject: 'Typed locally' },
    });
  });

  it('should adopt a remote change arriving after local edits were persisted and echoed', () => {
    const { result, rerender } = renderDraftHook('');

    act(() => {
      result.current.updateDraft({ subject: 'Typed locally' });
    });

    act(() => {
      jest.runOnlyPendingTimers();
    });

    rerender({ subject: 'Typed locally' });

    const resyncKeyAfterEcho = result.current.draftResyncKey;

    rerender({ subject: 'Updated by the AI afterwards' });

    expect(result.current.draft.subject).toBe('Updated by the AI afterwards');
    expect(result.current.draftResyncKey).not.toBe(resyncKeyAfterEcho);
  });
});
