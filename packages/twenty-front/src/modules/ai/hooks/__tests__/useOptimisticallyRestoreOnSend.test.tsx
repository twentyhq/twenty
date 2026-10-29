import { act, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';

import { useOptimisticallyRestoreOnSend } from '@/ai/hooks/useOptimisticallyRestoreOnSend';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';

const THREAD_ID = '20202020-0000-4000-8000-0000000000aa';
const LAST_ACTIVITY_AT = '2026-10-01T10:00:00.000Z';
const ARCHIVED_PARTICIPANT = {
  __typename: 'AgentChatThreadParticipant' as const,
  threadId: THREAD_ID,
  lastReadAt: LAST_ACTIVITY_AT,
  archivedAt: '2026-10-01T11:00:00.000Z',
  snoozedUntil: null,
  isSubscribed: true,
  lastMentionedAt: LAST_ACTIVITY_AT,
  lastResolvedMentionAt: null,
  id: 'participant-id',
  updatedAt: '2026-10-01T11:00:00.000Z',
};

describe('useOptimisticallyRestoreOnSend', () => {
  it('resolves the mention and restores the inbox on send, and undoes both if sending fails', async () => {
    const store = createStore();

    store.set(recordStoreFamilyState.atomFamily(THREAD_ID), {
      __typename: 'AgentChatThread',
      id: THREAD_ID,
      lastActivityAt: LAST_ACTIVITY_AT,
    } as never);
    store.set(agentChatThreadParticipantsState.atom, {
      [THREAD_ID]: ARCHIVED_PARTICIPANT,
    });

    const { result } = renderHook(() => useOptimisticallyRestoreOnSend(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      ),
    });
    const sentAt = '2026-10-01T12:00:00.000Z';
    const rollback = await act(() =>
      result.current.applyOptimisticRestore({
        threadId: THREAD_ID,
        optimisticUpdatedAt: sentAt,
      }),
    );

    expect(
      store.get(recordStoreFamilyState.atomFamily(THREAD_ID)),
    ).toMatchObject({ lastActivityAt: sentAt });
    expect(
      store.get(agentChatThreadParticipantsState.atom)?.[THREAD_ID],
    ).toEqual({
      __typename: 'AgentChatThreadParticipant' as const,
      threadId: THREAD_ID,
      lastReadAt: sentAt,
      archivedAt: null,
      snoozedUntil: null,
      isSubscribed: true,
      lastMentionedAt: LAST_ACTIVITY_AT,
      lastResolvedMentionAt: LAST_ACTIVITY_AT,
      id: 'participant-id',
      updatedAt: ARCHIVED_PARTICIPANT.updatedAt,
    });

    act(() => rollback());

    expect(
      store.get(recordStoreFamilyState.atomFamily(THREAD_ID)),
    ).toMatchObject({ lastActivityAt: LAST_ACTIVITY_AT });
    expect(
      store.get(agentChatThreadParticipantsState.atom)?.[THREAD_ID],
    ).toEqual(ARCHIVED_PARTICIPANT);
  });

  it('preserves a newer participant event when sending fails', async () => {
    const store = createStore();

    store.set(agentChatThreadParticipantsState.atom, {
      [THREAD_ID]: ARCHIVED_PARTICIPANT,
    });

    const { result } = renderHook(() => useOptimisticallyRestoreOnSend(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      ),
    });
    const rollback = await act(() =>
      result.current.applyOptimisticRestore({
        threadId: THREAD_ID,
        optimisticUpdatedAt: '2026-10-01T12:00:00.000Z',
      }),
    );

    const mentionedAgainParticipant = {
      ...ARCHIVED_PARTICIPANT,
      lastMentionedAt: '2026-10-01T12:01:00.000Z',
      updatedAt: '2026-10-01T12:01:00.000Z',
    };

    store.set(agentChatThreadParticipantsState.atom, {
      [THREAD_ID]: mentionedAgainParticipant,
    });

    act(() => rollback());

    expect(
      store.get(agentChatThreadParticipantsState.atom)?.[THREAD_ID],
    ).toEqual(mentionedAgainParticipant);
  });
});
