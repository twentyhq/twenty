import { act, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';

import { useUpdateAgentChatThreadInboxState } from '@/ai/hooks/useUpdateAgentChatThreadInboxState';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatThreadVisitState } from '@/ai/states/agentChatThreadVisitState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import {
  AgentChatInboxAction,
  GetAgentChatOpenThreadsSummaryDocument,
} from '~/generated-metadata/graphql';

const THREAD_ID = '20202020-0000-4000-8000-0000000000aa';
const OTHER_THREAD_ID = '20202020-0000-4000-8000-0000000000bb';
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

const renderUpdateInboxState = () => {
  const store = createStore();

  store.set(recordStoreFamilyState.atomFamily(THREAD_ID), {
    __typename: 'AgentChatThread',
    id: THREAD_ID,
    lastActivityAt: LAST_ACTIVITY_AT,
  } as never);
  store.set(agentChatThreadParticipantsState.atom, {});

  const { result } = renderHook(() => useUpdateAgentChatThreadInboxState(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    ),
  });

  return { result, store };
};

describe('useUpdateAgentChatThreadInboxState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('reads a thread up to its last activity before the server answers', async () => {
    mutate.mockReturnValue(new Promise(() => undefined));
    const { result, store } = renderUpdateInboxState();

    act(() => {
      void result.current.updateAgentChatThreadInboxState({
        threadIds: [THREAD_ID],
        action: AgentChatInboxAction.READ,
      });
    });

    expect(
      store.get(agentChatThreadParticipantsState.atom)?.[THREAD_ID],
    ).toEqual({
      threadId: THREAD_ID,
      lastReadAt: LAST_ACTIVITY_AT,
      archivedAt: null,
      snoozedUntil: null,
      isSubscribed: true,
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

    const participants = store.get(agentChatThreadParticipantsState.atom);

    expect(participants?.[THREAD_ID]?.archivedAt).toEqual(expect.any(String));
    expect(participants?.[OTHER_THREAD_ID]?.archivedAt).toEqual(
      expect.any(String),
    );
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(refetchQueries).toHaveBeenCalledWith({
      include: [GetAgentChatOpenThreadsSummaryDocument],
    });
  });

  it('puts the member state back and reports a refused snooze', async () => {
    mutate.mockRejectedValue(new Error('Snooze time must be in the future'));
    const { result, store } = renderUpdateInboxState();

    store.set(agentChatThreadParticipantsState.atom, {
      [THREAD_ID]: READ_PARTICIPANT,
    });

    await act(async () => {
      await result.current.updateAgentChatThreadInboxState({
        threadIds: [THREAD_ID],
        action: AgentChatInboxAction.SNOOZE,
        snoozedUntil: new Date('2026-10-02T09:00:00.000Z'),
      });
    });

    expect(
      store.get(agentChatThreadParticipantsState.atom)?.[THREAD_ID],
    ).toEqual(READ_PARTICIPANT);
    expect(enqueueToast).toHaveBeenCalled();
  });

  it('keeps a row the server sent while a refused change was on its way', async () => {
    const { result, store } = renderUpdateInboxState();
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
      await result.current.updateAgentChatThreadInboxState({
        threadIds: [THREAD_ID],
        action: AgentChatInboxAction.UNREAD,
      });
    });

    expect(
      store.get(agentChatThreadParticipantsState.atom)?.[THREAD_ID],
    ).toEqual(archivedParticipant);
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

    expect(store.get(agentChatThreadParticipantsState.atom)).toEqual({});
  });

  it('keeps the thread on screen unread when the member marks it unread', async () => {
    mutate.mockReturnValue(new Promise(() => undefined));
    const { result, store } = renderUpdateInboxState();

    store.set(agentChatThreadVisitState.atom, {
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

    expect(store.get(agentChatThreadVisitState.atom)).toEqual({
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

    store.set(agentChatThreadVisitState.atom, visit);

    await act(async () => {
      await result.current.updateAgentChatThreadInboxState({
        threadIds: [THREAD_ID],
        action: AgentChatInboxAction.UNREAD,
      });
    });

    expect(store.get(agentChatThreadVisitState.atom)).toEqual(visit);
  });
});
