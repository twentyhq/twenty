import { renderHook } from '@testing-library/react';

import { useWarnAboutParticipantMentionsNotAdded } from '@/ai/hooks/useWarnAboutParticipantMentionsNotAdded';

const THREAD_ID = '20202020-0000-4000-8000-0000000000aa';
const INITIAL_RECIPIENT = { workspaceMemberId: 'jane', label: 'Jane' };
const PARTICIPANT_MENTION = { workspaceMemberId: 'jony', label: 'Jony' };
const fetchAgentChatThreadsPage = jest.fn();
const enqueueToast = jest.fn();

jest.mock('@/ai/hooks/useFetchAgentChatThreadsPage', () => ({
  useFetchAgentChatThreadsPage: () => ({ fetchAgentChatThreadsPage }),
}));

jest.mock('twenty-ui/components/feedback', () => ({
  useToast: () => ({ enqueueToast }),
}));

describe('useWarnAboutParticipantMentionsNotAdded', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('does not warn about recipients delivered before a failed first send', async () => {
    fetchAgentChatThreadsPage.mockResolvedValue({
      threads: [
        {
          id: THREAD_ID,
          writerWorkspaceMemberIds: [INITIAL_RECIPIENT.workspaceMemberId],
        },
      ],
    });
    const { result } = renderHook(() =>
      useWarnAboutParticipantMentionsNotAdded(),
    );

    await result.current.warnAboutParticipantMentionsNotAdded({
      threadId: THREAD_ID,
      initialRecipients: [INITIAL_RECIPIENT],
      participantMentions: [],
      addedWorkspaceMemberIds: [],
    });

    expect(fetchAgentChatThreadsPage).toHaveBeenCalledTimes(1);
    expect(fetchAgentChatThreadsPage).toHaveBeenCalledWith({
      lastCursor: null,
      threadIdFilter: { id: { eq: THREAD_ID } },
    });
    expect(enqueueToast).not.toHaveBeenCalled();
  });

  it.each([
    {
      scenario: 'another recipient',
      writerWorkspaceMemberIds: [PARTICIPANT_MENTION.workspaceMemberId],
    },
    { scenario: 'no recorded recipients', writerWorkspaceMemberIds: null },
  ])(
    'warns when a selected recipient is absent from a thread with $scenario',
    async ({ writerWorkspaceMemberIds }) => {
      fetchAgentChatThreadsPage.mockResolvedValue({
        threads: [{ id: THREAD_ID, writerWorkspaceMemberIds }],
      });
      const { result } = renderHook(() =>
        useWarnAboutParticipantMentionsNotAdded(),
      );

      await result.current.warnAboutParticipantMentionsNotAdded({
        threadId: THREAD_ID,
        initialRecipients: [INITIAL_RECIPIENT],
        participantMentions: [],
        addedWorkspaceMemberIds: [],
      });

      expect(enqueueToast).toHaveBeenCalledTimes(1);
      expect(enqueueToast).toHaveBeenCalledWith({
        status: 'warning',
        children:
          "Jane could not be added to this chat because they can't reply in it.",
      });
    },
  );

  it.each(['unavailable', 'failed', 'missing membership'])(
    'preserves mention warnings when recipient verification is %s',
    async (verificationOutcome) => {
      fetchAgentChatThreadsPage.mockImplementation(async () => {
        if (verificationOutcome === 'failed') {
          throw new Error('Network error');
        }

        if (verificationOutcome === 'missing membership') {
          return { threads: [{ id: THREAD_ID }] };
        }

        return undefined;
      });
      const { result } = renderHook(() =>
        useWarnAboutParticipantMentionsNotAdded(),
      );

      await result.current.warnAboutParticipantMentionsNotAdded({
        threadId: THREAD_ID,
        initialRecipients: [INITIAL_RECIPIENT],
        participantMentions: [PARTICIPANT_MENTION],
        addedWorkspaceMemberIds: [],
      });

      expect(enqueueToast).toHaveBeenCalledTimes(1);
      expect(enqueueToast).toHaveBeenCalledWith({
        status: 'warning',
        children:
          "Jony could not be added to this chat because they can't reply in it.",
      });
    },
  );

  it('does not read the thread when every initial recipient was accepted', async () => {
    const { result } = renderHook(() =>
      useWarnAboutParticipantMentionsNotAdded(),
    );

    await result.current.warnAboutParticipantMentionsNotAdded({
      threadId: THREAD_ID,
      initialRecipients: [INITIAL_RECIPIENT],
      participantMentions: [],
      addedWorkspaceMemberIds: [INITIAL_RECIPIENT.workspaceMemberId],
    });

    expect(fetchAgentChatThreadsPage).not.toHaveBeenCalled();
    expect(enqueueToast).not.toHaveBeenCalled();
  });
});
