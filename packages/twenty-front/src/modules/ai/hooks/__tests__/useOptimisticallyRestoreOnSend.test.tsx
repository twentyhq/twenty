import { act, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';

import { useOptimisticallyRestoreOnSend } from '@/ai/hooks/useOptimisticallyRestoreOnSend';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';

const THREAD_ID = '20202020-0000-4000-8000-0000000000aa';
const LAST_ACTIVITY_AT = '2026-10-01T10:00:00.000Z';
const ARCHIVED_PARTICIPANT = {
  threadId: THREAD_ID,
  lastReadAt: LAST_ACTIVITY_AT,
  archivedAt: '2026-10-01T11:00:00.000Z',
  snoozedUntil: null,
  hasSnoozeEnded: false,
  updatedAt: '2026-10-01T11:00:00.000Z',
};

describe('useOptimisticallyRestoreOnSend', () => {
  it('moves a thread the member writes in back to their inbox, and undoes it if sending fails', () => {
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
    let rollback: () => void = () => undefined;

    act(() => {
      rollback = result.current.applyOptimisticRestore({
        threadId: THREAD_ID,
        optimisticUpdatedAt: sentAt,
      });
    });

    expect(
      store.get(recordStoreFamilyState.atomFamily(THREAD_ID)),
    ).toMatchObject({ lastActivityAt: sentAt });
    expect(
      store.get(agentChatThreadParticipantsState.atom)?.[THREAD_ID],
    ).toEqual({
      threadId: THREAD_ID,
      lastReadAt: sentAt,
      archivedAt: null,
      snoozedUntil: null,
      hasSnoozeEnded: false,
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

  it('moves the thread up by its last change before the workspace tracks last activity', () => {
    const store = createStore();

    store.set(recordStoreFamilyState.atomFamily(THREAD_ID), {
      __typename: 'AgentChatThread',
      id: THREAD_ID,
      updatedAt: LAST_ACTIVITY_AT,
    } as never);

    const { result } = renderHook(() => useOptimisticallyRestoreOnSend(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      ),
    });
    const sentAt = '2026-10-01T12:00:00.000Z';

    act(() => {
      result.current.applyOptimisticRestore({
        threadId: THREAD_ID,
        optimisticUpdatedAt: sentAt,
      });
    });

    const thread = store.get(recordStoreFamilyState.atomFamily(THREAD_ID));

    expect(thread).toMatchObject({ updatedAt: sentAt });
    expect(thread).not.toHaveProperty('lastActivityAt');
  });
});
