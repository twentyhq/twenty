import { act, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';

import { useAgentChatThreadParticipants } from '@/ai/hooks/useAgentChatThreadParticipants';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatThreadStreamedParticipantsState } from '@/ai/states/agentChatThreadStreamedParticipantsState';
import { agentChatThreadVisitState } from '@/ai/states/agentChatThreadVisitState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';

const THREAD_ID = '20202020-0000-4000-8000-0000000000aa';
const LAST_ACTIVITY_AT = '2026-10-01T10:00:00.000Z';
const READ_PARTICIPANT = {
  threadId: THREAD_ID,
  lastReadAt: LAST_ACTIVITY_AT,
  archivedAt: null,
  snoozedUntil: null,
  hasSnoozeEnded: false,
  updatedAt: '2026-10-01T10:00:00.000Z',
};

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
  store.set(agentChatThreadParticipantsState.atom, {});

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
        myAgentChatThreadParticipants: [READ_PARTICIPANT],
      },
    });
    const { result, store } = renderParticipants();

    await act(async () => {
      await result.current.refreshAgentChatThreadParticipants();
    });

    expect(store.get(agentChatThreadParticipantsState.atom)).toEqual({
      [THREAD_ID]: READ_PARTICIPANT,
    });
  });

  it('keeps a change the server sent while the member state was loading', async () => {
    const { result, store } = renderParticipants();
    const unreadParticipant = {
      ...READ_PARTICIPANT,
      lastReadAt: null,
      updatedAt: '2026-10-01T10:05:00.000Z',
    };

    query.mockImplementation(async () => {
      store.set(agentChatThreadStreamedParticipantsState.atom, {
        [THREAD_ID]: unreadParticipant,
      });

      return { data: { myAgentChatThreadParticipants: [READ_PARTICIPANT] } };
    });

    await act(async () => {
      await result.current.refreshAgentChatThreadParticipants();
    });

    expect(store.get(agentChatThreadParticipantsState.atom)).toEqual({
      [THREAD_ID]: unreadParticipant,
    });
  });

  it('reads a thread up to its last activity before the server answers', async () => {
    mutate.mockReturnValue(new Promise(() => undefined));
    const { result, store } = renderParticipants();

    act(() => {
      void result.current.markAgentChatThreadAsRead(THREAD_ID);
    });

    expect(
      store.get(agentChatThreadParticipantsState.atom)?.[THREAD_ID],
    ).toEqual({ threadId: THREAD_ID, lastReadAt: LAST_ACTIVITY_AT });
  });

  it('keeps an archive the server accepted', async () => {
    mutate.mockResolvedValue({ data: {} });
    const { result, store } = renderParticipants();

    await act(async () => {
      await result.current.archiveAgentChatThread(THREAD_ID);
    });

    expect(
      store.get(agentChatThreadParticipantsState.atom)?.[THREAD_ID]?.archivedAt,
    ).toEqual(expect.any(String));
  });

  it('reloads the server state and reports a refused snooze', async () => {
    mutate.mockRejectedValue(new Error('Snooze time must be in the future'));
    query.mockResolvedValue({
      data: {
        myAgentChatThreadParticipants: [READ_PARTICIPANT],
      },
    });
    const { result, store } = renderParticipants();

    await act(async () => {
      await result.current.snoozeAgentChatThreads({
        threadIds: [THREAD_ID],
        snoozedUntil: new Date('2026-10-02T09:00:00.000Z'),
      });
    });

    expect(
      store.get(agentChatThreadParticipantsState.atom)?.[THREAD_ID],
    ).toEqual(READ_PARTICIPANT);
    expect(enqueueToast).toHaveBeenCalled();
  });

  it('keeps the thread on screen unread when the member marks it unread', async () => {
    mutate.mockReturnValue(new Promise(() => undefined));
    const { result, store } = renderParticipants();

    store.set(agentChatThreadVisitState.atom, {
      threadId: THREAD_ID,
      isUnread: false,
      lastReadAt: LAST_ACTIVITY_AT,
      isKeptUnread: false,
    });

    act(() => {
      void result.current.markAgentChatThreadAsUnread(THREAD_ID);
    });

    expect(store.get(agentChatThreadVisitState.atom)).toEqual({
      threadId: THREAD_ID,
      isUnread: true,
      lastReadAt: null,
      isKeptUnread: true,
    });
  });

  it('puts the visit back when the server refuses to mark it unread', async () => {
    mutate.mockRejectedValue(new Error('Network error'));
    query.mockResolvedValue({
      data: { myAgentChatThreadParticipants: [READ_PARTICIPANT] },
    });
    const { result, store } = renderParticipants();
    const visit = {
      threadId: THREAD_ID,
      isUnread: false,
      lastReadAt: LAST_ACTIVITY_AT,
      isKeptUnread: false,
    };

    store.set(agentChatThreadVisitState.atom, visit);

    await act(async () => {
      await result.current.markAgentChatThreadAsUnread(THREAD_ID);
    });

    expect(store.get(agentChatThreadVisitState.atom)).toEqual(visit);
  });
});
