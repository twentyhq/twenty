import { act, render } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';

import { AiChatThreadViewEffect } from '@/ai-chat/instance/components/AiChatThreadViewEffect';
import { aiChatThreadParticipantsState } from '@/ai-chat/threads/states/aiChatThreadParticipantsState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { AgentChatInboxAction } from '~/generated-metadata/graphql';
import { mockedWorkspaceMemberData } from '~/testing/mock-data/users';

const mockUpdateAiChatThreadInboxState = jest.fn();

jest.mock('@/ai-chat/threads/hooks/useUpdateAiChatThreadInboxState', () => ({
  useUpdateAiChatThreadInboxState: () => ({
    updateAiChatThreadInboxState: mockUpdateAiChatThreadInboxState,
  }),
}));

const THREAD_ID = '20202020-0000-4000-8000-000000000001';
const LAST_ACTIVITY_AT = '2026-11-26T10:00:00.000Z';

const createStoreWithSettledThread = () => {
  const store = createStore();

  store.set(currentWorkspaceMemberState.atom, mockedWorkspaceMemberData);
  store.set(recordStoreFamilyState.atomFamily(THREAD_ID), {
    __typename: 'AgentChatThread',
    id: THREAD_ID,
    deletedAt: null,
    lastActivityAt: LAST_ACTIVITY_AT,
    lastMessageSenderWorkspaceMemberId: null,
    workspaceMemberId: mockedWorkspaceMemberData.id,
    assigneeId: null,
    pendingQuestionMessageId: null,
  });
  store.set(aiChatThreadParticipantsState.atom, {
    isLoaded: true,
    rowsByThreadId: {
      [THREAD_ID]: {
        __typename: 'AgentChatThreadParticipant',
        id: 'participant-id',
        threadId: THREAD_ID,
        lastReadAt: LAST_ACTIVITY_AT,
        archivedAt: null,
        snoozedUntil: null,
        isSubscribed: true,
        lastMentionedAt: null,
        mentionsResolvedAt: null,
        updatedAt: LAST_ACTIVITY_AT,
      },
    },
  });

  return store;
};

const flushMicrotasks = () =>
  act(async () => {
    await Promise.resolve();
  });

describe('AiChatThreadViewEffect', () => {
  beforeEach(() => {
    mockUpdateAiChatThreadInboxState.mockClear();
  });

  it('archives a settled thread once its last view closes', async () => {
    const store = createStoreWithSettledThread();
    const { unmount } = render(
      <JotaiProvider store={store}>
        <AiChatThreadViewEffect threadId={THREAD_ID} />
      </JotaiProvider>,
    );

    unmount();
    await flushMicrotasks();

    expect(mockUpdateAiChatThreadInboxState).toHaveBeenCalledWith({
      threadIds: [THREAD_ID],
      action: AgentChatInboxAction.ARCHIVE,
    });
  });

  it('keeps a settled thread when another view of it replaces the chat', async () => {
    const store = createStoreWithSettledThread();
    const { rerender } = render(
      <JotaiProvider store={store}>
        <AiChatThreadViewEffect key="chat" threadId={THREAD_ID} />
      </JotaiProvider>,
    );

    rerender(
      <JotaiProvider store={store}>
        <AiChatThreadViewEffect key="tool-call-page" threadId={THREAD_ID} />
      </JotaiProvider>,
    );
    await flushMicrotasks();

    expect(mockUpdateAiChatThreadInboxState).not.toHaveBeenCalled();
  });
});
