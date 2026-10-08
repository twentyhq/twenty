import { act, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';

import { useAgentChatThreadParticipants } from '@/ai/hooks/useAgentChatThreadParticipants';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatThreadVisitState } from '@/ai/states/agentChatThreadVisitState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { GetAgentChatOpenThreadsSummaryDocument } from '~/generated-metadata/graphql';

const THREAD_ID = '20202020-0000-4000-8000-0000000000aa';
const LAST_ACTIVITY_AT = '2026-10-01T10:00:00.000Z';
const READ_PARTICIPANT = {
  threadId: THREAD_ID,
  lastReadAt: LAST_ACTIVITY_AT,
  archivedAt: null,
  snoozedUntil: null,
  isSubscribed: true,
  lastMentionedAt: null,
  id: 'participant-id',
  updatedAt: '2026-10-01T10:00:00.000Z',
};

const mutate = jest.fn();
const refetchQueries = jest.fn(() => Promise.resolve([]));
const enqueueToast = jest.fn();

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useApolloClient: () => ({ mutate, refetchQueries }),
}));

jest.mock('twenty-ui/components/feedback', () => ({
  ...jest.requireActual('twenty-ui/components/feedback'),
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
    expect(refetchQueries).toHaveBeenCalledWith({
      include: [GetAgentChatOpenThreadsSummaryDocument],
    });
  });

  it('puts the member state back and reports a refused snooze', async () => {
    mutate.mockRejectedValue(new Error('Snooze time must be in the future'));
    const { result, store } = renderParticipants();

    store.set(agentChatThreadParticipantsState.atom, {
      [THREAD_ID]: READ_PARTICIPANT,
    });

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

  it('keeps a row the server sent while a refused change was on its way', async () => {
    const { result, store } = renderParticipants();
    const archivedParticipant = {
      ...READ_PARTICIPANT,
      archivedAt: '2026-10-01T10:05:00.000Z',
      updatedAt: '2026-10-01T10:05:00.000Z',
    };

    store.set(agentChatThreadParticipantsState.atom, {
      [THREAD_ID]: READ_PARTICIPANT,
    });
    mutate.mockImplementation(async () => {
      store.set(agentChatThreadParticipantsState.atom, {
        [THREAD_ID]: archivedParticipant,
      });

      throw new Error('Network error');
    });

    await act(async () => {
      await result.current.markAgentChatThreadAsUnread(THREAD_ID);
    });

    expect(
      store.get(agentChatThreadParticipantsState.atom)?.[THREAD_ID],
    ).toEqual(archivedParticipant);
  });

  it('removes the change of a refused update on a thread without a row', async () => {
    mutate.mockRejectedValue(new Error('Network error'));
    const { result, store } = renderParticipants();

    await act(async () => {
      await result.current.archiveAgentChatThread(THREAD_ID);
    });

    expect(store.get(agentChatThreadParticipantsState.atom)).toEqual({});
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
