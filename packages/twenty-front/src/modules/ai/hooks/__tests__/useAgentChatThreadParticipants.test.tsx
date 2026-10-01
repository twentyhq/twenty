import { act, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';

import { useAgentChatThreadParticipants } from '@/ai/hooks/useAgentChatThreadParticipants';
import { agentChatThreadKeptUnreadIdState } from '@/ai/states/agentChatThreadKeptUnreadIdState';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatThreadUnreadSinceState } from '@/ai/states/agentChatThreadUnreadSinceState';
import { agentChatViewedThreadIdState } from '@/ai/states/agentChatViewedThreadIdState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';

const THREAD_ID = '20202020-0000-4000-8000-0000000000aa';
const LAST_ACTIVITY_AT = '2026-10-01T10:00:00.000Z';

const query = jest.fn();
const mutate = jest.fn();
const enqueueToast = jest.fn();

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useApolloClient: () => ({ query, mutate }),
}));

jest.mock('twenty-ui/components', () => ({
  ...jest.requireActual('twenty-ui/components'),
  useToast: () => ({ enqueueToast }),
}));

const renderParticipants = () => {
  const store = createStore();

  store.set(recordStoreFamilyState.atomFamily(THREAD_ID), {
    __typename: 'AgentChatThread',
    id: THREAD_ID,
    lastActivityAt: LAST_ACTIVITY_AT,
  } as never);

  const { result } = renderHook(() => useAgentChatThreadParticipants(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    ),
  });

  return { result, store };
};

describe('useAgentChatThreadParticipants', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads the member state of every thread', async () => {
    query.mockResolvedValue({
      data: {
        myAgentChatThreadParticipants: [
          {
            threadId: THREAD_ID,
            lastReadAt: LAST_ACTIVITY_AT,
            archivedAt: null,
            snoozedUntil: null,
          },
        ],
      },
    });
    const { result, store } = renderParticipants();

    await act(async () => {
      await result.current.refreshAgentChatThreadParticipants();
    });

    expect(store.get(agentChatThreadParticipantsState.atom)).toEqual({
      [THREAD_ID]: {
        lastReadAt: LAST_ACTIVITY_AT,
        archivedAt: null,
        snoozedUntil: null,
      },
    });
  });

  it('reads a thread up to its last activity before the server answers', async () => {
    mutate.mockReturnValue(new Promise(() => undefined));
    const { result, store } = renderParticipants();

    act(() => {
      void result.current.markAgentChatThreadAsRead(THREAD_ID);
    });

    expect(store.get(agentChatThreadParticipantsState.atom)[THREAD_ID]).toEqual(
      { lastReadAt: LAST_ACTIVITY_AT, archivedAt: null, snoozedUntil: null },
    );
  });

  it('keeps an archive the server accepted', async () => {
    mutate.mockResolvedValue({ data: {} });
    const { result, store } = renderParticipants();

    await act(async () => {
      await result.current.archiveAgentChatThread(THREAD_ID);
    });

    expect(
      store.get(agentChatThreadParticipantsState.atom)[THREAD_ID]?.archivedAt,
    ).toEqual(expect.any(String));
  });

  it('reloads the server state and reports a refused snooze', async () => {
    mutate.mockRejectedValue(new Error('Snooze time must be in the future'));
    query.mockResolvedValue({
      data: {
        myAgentChatThreadParticipants: [
          {
            threadId: THREAD_ID,
            lastReadAt: LAST_ACTIVITY_AT,
            archivedAt: null,
            snoozedUntil: null,
          },
        ],
      },
    });
    const { result, store } = renderParticipants();

    await act(async () => {
      await result.current.snoozeAgentChatThread({
        threadId: THREAD_ID,
        snoozedUntil: new Date('2026-10-02T09:00:00.000Z'),
      });
    });

    expect(store.get(agentChatThreadParticipantsState.atom)[THREAD_ID]).toEqual(
      { lastReadAt: LAST_ACTIVITY_AT, archivedAt: null, snoozedUntil: null },
    );
    expect(enqueueToast).toHaveBeenCalled();
  });

  it('moves a thread a member writes in back to their inbox, and undoes it if sending fails', () => {
    const { result, store } = renderParticipants();

    store.set(agentChatThreadParticipantsState.atom, {
      [THREAD_ID]: {
        lastReadAt: LAST_ACTIVITY_AT,
        archivedAt: '2026-10-01T11:00:00.000Z',
        snoozedUntil: null,
      },
    });

    const sentAt = '2026-10-01T12:00:00.000Z';
    let rollback: () => void = () => undefined;

    act(() => {
      rollback = result.current.applyLocalMemberActivity({
        threadId: THREAD_ID,
        activityAt: sentAt,
      });
    });

    expect(
      store.get(recordStoreFamilyState.atomFamily(THREAD_ID)),
    ).toMatchObject({ lastActivityAt: sentAt });
    expect(store.get(agentChatThreadParticipantsState.atom)[THREAD_ID]).toEqual(
      { lastReadAt: sentAt, archivedAt: null, snoozedUntil: null },
    );

    act(() => rollback());

    expect(
      store.get(recordStoreFamilyState.atomFamily(THREAD_ID)),
    ).toMatchObject({ lastActivityAt: LAST_ACTIVITY_AT });
    expect(
      store.get(agentChatThreadParticipantsState.atom)[THREAD_ID],
    ).toMatchObject({ archivedAt: '2026-10-01T11:00:00.000Z' });
  });

  it('ignores a late answer to an action the member has since replaced', async () => {
    let resolveArchive: (value: unknown) => void = () => undefined;

    mutate
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveArchive = resolve;
        }),
      )
      .mockResolvedValueOnce({ data: {} });
    const { result, store } = renderParticipants();

    let archive: Promise<void> = Promise.resolve();

    act(() => {
      archive = result.current.archiveAgentChatThread(THREAD_ID);
    });
    await act(async () => {
      await result.current.moveAgentChatThreadToInbox(THREAD_ID);
    });
    await act(async () => {
      resolveArchive({ data: {} });
      await archive;
    });

    expect(
      store.get(agentChatThreadParticipantsState.atom)[THREAD_ID]?.archivedAt,
    ).toBeNull();
  });

  it('keeps the thread on screen unread when the member marks it unread', async () => {
    mutate.mockReturnValue(new Promise(() => undefined));
    const { result, store } = renderParticipants();

    store.set(agentChatViewedThreadIdState.atom, THREAD_ID);
    store.set(agentChatThreadUnreadSinceState.atom, {
      threadId: THREAD_ID,
      visitId: 'visit',
      isUnread: false,
      lastReadAt: LAST_ACTIVITY_AT,
    });

    act(() => {
      void result.current.markAgentChatThreadAsUnread(THREAD_ID);
    });

    expect(store.get(agentChatThreadKeptUnreadIdState.atom)).toBe(THREAD_ID);
    expect(store.get(agentChatThreadUnreadSinceState.atom)).toEqual({
      threadId: THREAD_ID,
      visitId: 'visit',
      isUnread: true,
      lastReadAt: null,
    });
  });
});
