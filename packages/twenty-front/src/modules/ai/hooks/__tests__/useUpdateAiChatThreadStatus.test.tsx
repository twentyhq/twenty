import { act, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';

import { useUpdateAiChatThreadStatus } from '@/ai/hooks/useUpdateAiChatThreadStatus';
import { aiChatReopenedThreadActivityState } from '@/ai/states/aiChatReopenedThreadActivityState';
import { aiChatThreadParticipantsState } from '@/ai/states/aiChatThreadParticipantsState';
import { aiChatThreadVisitState } from '@/ai/states/aiChatThreadVisitState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { AgentChatInboxAction } from '~/generated-metadata/graphql';

const THREAD_ID = '20202020-0000-4000-8000-0000000000aa';
const OTHER_THREAD_ID = '20202020-0000-4000-8000-0000000000bb';
const LAST_ACTIVITY_AT = '2026-10-01T10:00:00.000Z';
const READ_PARTICIPANT = {
  __typename: 'AgentChatThreadParticipant' as const,
  threadId: THREAD_ID,
  lastReadAt: LAST_ACTIVITY_AT,
  archivedAt: null,
  snoozedUntil: null,
  isSubscribed: true,
  lastMentionedAt: null,
  mentionsResolvedAt: null,
  id: 'participant-id',
  updatedAt: '2026-10-01T10:00:00.000Z',
};

const mutate = jest.fn();
const enqueueToast = jest.fn();

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useApolloClient: () => ({ mutate }),
}));

jest.mock('twenty-ui/components/feedback', () => ({
  ...jest.requireActual('twenty-ui/components/feedback'),
  useToast: () => ({ enqueueToast }),
}));

const renderUpdateInboxState = () => {
  const store = createStore();

  store.set(recordStoreFamilyState.atomFamily(THREAD_ID), {
    __typename: 'AgentChatThread',
    id: THREAD_ID,
    lastActivityAt: LAST_ACTIVITY_AT,
  } as never);
  store.set(aiChatThreadParticipantsState.atom, {});

  const { result } = renderHook(() => useUpdateAiChatThreadStatus(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    ),
  });

  return { result, store };
};

describe('useUpdateAiChatThreadStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('reads a thread up to its last activity before the server answers, without following it', async () => {
    mutate.mockReturnValue(new Promise(() => undefined));
    const { result, store } = renderUpdateInboxState();

    act(() => {
      void result.current.updateAgentChatThreadInboxState({
        threadIds: [THREAD_ID],
        action: AgentChatInboxAction.READ,
      });
    });

    expect(store.get(aiChatThreadParticipantsState.atom)?.[THREAD_ID]).toEqual({
      threadId: THREAD_ID,
      lastReadAt: LAST_ACTIVITY_AT,
      archivedAt: null,
      snoozedUntil: null,
      isSubscribed: false,
      lastMentionedAt: null,
      mentionsResolvedAt: null,
    });
  });

  it('archives every selected thread in one request the server accepted', async () => {
    mutate.mockResolvedValue({ data: {} });
    const { result, store } = renderUpdateInboxState();

    await act(async () => {
      await result.current.updateAgentChatThreadInboxState({
        threadIds: [THREAD_ID, OTHER_THREAD_ID],
        action: AgentChatInboxAction.ARCHIVE,
      });
    });

    const participants = store.get(aiChatThreadParticipantsState.atom);

    expect(participants?.[THREAD_ID]).toMatchObject({
      archivedAt: expect.any(String),
      isSubscribed: true,
    });
    expect(participants?.[OTHER_THREAD_ID]?.archivedAt).toEqual(
      expect.any(String),
    );
    expect(mutate).toHaveBeenCalledTimes(1);
  });

  it('remembers the activity of each thread the member reopens', async () => {
    mutate.mockResolvedValue({ data: {} });
    const { result, store } = renderUpdateInboxState();

    await act(async () => {
      await result.current.updateAgentChatThreadInboxState({
        threadIds: [THREAD_ID, OTHER_THREAD_ID],
        action: AgentChatInboxAction.MOVE_TO_INBOX,
      });
    });

    expect(store.get(aiChatReopenedThreadActivityState.atom)).toEqual({
      [THREAD_ID]: LAST_ACTIVITY_AT,
      [OTHER_THREAD_ID]: null,
    });
  });

  it('puts the member state back and reports a refused snooze', async () => {
    mutate.mockRejectedValue(new Error('Snooze time must be in the future'));
    const { result, store } = renderUpdateInboxState();

    store.set(aiChatThreadParticipantsState.atom, {
      [THREAD_ID]: READ_PARTICIPANT,
    });

    await act(async () => {
      await result.current.updateAgentChatThreadInboxState({
        threadIds: [THREAD_ID],
        action: AgentChatInboxAction.SNOOZE,
        snoozedUntil: new Date('2026-10-02T09:00:00.000Z'),
      });
    });

    expect(store.get(aiChatThreadParticipantsState.atom)?.[THREAD_ID]).toEqual(
      READ_PARTICIPANT,
    );
    expect(enqueueToast).toHaveBeenCalled();
  });

  it('keeps a row the server sent while a refused change was on its way', async () => {
    const { result, store } = renderUpdateInboxState();
    const archivedParticipant = {
      ...READ_PARTICIPANT,
      archivedAt: '2026-10-01T10:05:00.000Z',
      updatedAt: '2026-10-01T10:05:00.000Z',
    };

    store.set(aiChatThreadParticipantsState.atom, {
      [THREAD_ID]: READ_PARTICIPANT,
    });
    mutate.mockImplementation(async () => {
      store.set(aiChatThreadParticipantsState.atom, {
        [THREAD_ID]: archivedParticipant,
      });

      throw new Error('Network error');
    });

    await act(async () => {
      await result.current.updateAgentChatThreadInboxState({
        threadIds: [THREAD_ID],
        action: AgentChatInboxAction.UNREAD,
      });
    });

    expect(store.get(aiChatThreadParticipantsState.atom)?.[THREAD_ID]).toEqual(
      archivedParticipant,
    );
  });

  it('removes the change of a refused update on a thread without a row', async () => {
    mutate.mockRejectedValue(new Error('Network error'));
    const { result, store } = renderUpdateInboxState();

    await act(async () => {
      await result.current.updateAgentChatThreadInboxState({
        threadIds: [THREAD_ID],
        action: AgentChatInboxAction.ARCHIVE,
      });
    });

    expect(store.get(aiChatThreadParticipantsState.atom)).toEqual({});
  });

  it('keeps the thread on screen unread when the member marks it unread', async () => {
    mutate.mockReturnValue(new Promise(() => undefined));
    const { result, store } = renderUpdateInboxState();

    store.set(aiChatThreadVisitState.atom, {
      threadId: THREAD_ID,
      isUnread: false,
      lastReadAt: LAST_ACTIVITY_AT,
      isKeptUnread: false,
    });

    act(() => {
      void result.current.updateAgentChatThreadInboxState({
        threadIds: [THREAD_ID],
        action: AgentChatInboxAction.UNREAD,
      });
    });

    expect(store.get(aiChatThreadVisitState.atom)).toEqual({
      threadId: THREAD_ID,
      isUnread: true,
      lastReadAt: null,
      isKeptUnread: true,
    });
  });

  it('puts the visit back when the server refuses to mark it unread', async () => {
    mutate.mockRejectedValue(new Error('Network error'));
    const { result, store } = renderUpdateInboxState();
    const visit = {
      threadId: THREAD_ID,
      isUnread: false,
      lastReadAt: LAST_ACTIVITY_AT,
      isKeptUnread: false,
    };

    store.set(aiChatThreadVisitState.atom, visit);

    await act(async () => {
      await result.current.updateAgentChatThreadInboxState({
        threadIds: [THREAD_ID],
        action: AgentChatInboxAction.UNREAD,
      });
    });

    expect(store.get(aiChatThreadVisitState.atom)).toEqual(visit);
  });

  it('keeps a visit to another chat opened while the refused request was pending', async () => {
    const { result, store } = renderUpdateInboxState();
    const otherVisit = {
      threadId: OTHER_THREAD_ID,
      isUnread: true,
      lastReadAt: null,
      isKeptUnread: false,
    };

    mutate.mockImplementation(async () => {
      store.set(aiChatThreadVisitState.atom, otherVisit);
      throw new Error('Network error');
    });
    store.set(aiChatThreadVisitState.atom, {
      threadId: THREAD_ID,
      isUnread: false,
      lastReadAt: LAST_ACTIVITY_AT,
      isKeptUnread: false,
    });

    await act(async () => {
      await result.current.updateAgentChatThreadInboxState({
        threadIds: [THREAD_ID, OTHER_THREAD_ID],
        action: AgentChatInboxAction.UNREAD,
      });
    });

    expect(store.get(aiChatThreadVisitState.atom)).toEqual(otherVisit);
  });
});
