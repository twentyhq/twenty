import { createStore } from 'jotai';

import { agentChatSnoozedThreadListState } from '@/ai/states/agentChatSnoozedThreadListState';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatSnoozedThreadsSelector } from '@/ai/states/selectors/agentChatSnoozedThreadsSelector';
import { setAgentChatThreadList } from '@/ai/testing/setAgentChatThreadList';

describe('agentChatSnoozedThreadsSelector', () => {
  it('keeps cached equal-deadline chats within the captured cursor when a loaded chat is snoozed again', () => {
    const store = createStore();
    const wakeAt = '2026-11-04T09:00:00.000Z';
    const threadIds = ['alpha', 'middle', 'omega'];
    const participants = Object.fromEntries(
      threadIds.map((threadId) => [
        threadId,
        {
          __typename: 'AgentChatThreadParticipant' as const,
          id: `${threadId}-participant`,
          threadId,
          isSubscribed: true,
          archivedAt: '2026-11-03T10:00:00.000Z',
          snoozedUntil: wakeAt,
          lastReadAt: null,
          lastMentionedAt: null,
          mentionsResolvedAt: null,
          updatedAt: '2026-11-03T10:00:00.000Z',
        },
      ]),
    );

    setAgentChatThreadList(
      store,
      threadIds.map((id) => ({
        __typename: 'AgentChatThread',
        id,
        title: id,
        deletedAt: null,
        createdAt: '2026-11-03T09:00:00.000Z',
        updatedAt: '2026-11-03T09:00:00.000Z',
      })),
    );
    store.set(agentChatThreadParticipantsState.atom, participants);
    store.set(agentChatSnoozedThreadListState.atom, {
      threadIds: ['middle'],
      hasNextPage: true,
      endCursor: 'cursor',
      lastLoadedSortAt: wakeAt,
      lastLoadedThreadId: 'middle',
    });

    expect(
      store.get(agentChatSnoozedThreadsSelector.atom).map(({ id }) => id),
    ).toEqual(['middle', 'omega']);

    store.set(agentChatThreadParticipantsState.atom, {
      ...participants,
      middle: {
        ...participants.middle,
        snoozedUntil: '2026-11-04T18:00:00.000Z',
      },
    });

    expect(
      store.get(agentChatSnoozedThreadsSelector.atom).map(({ id }) => id),
    ).toEqual(['omega']);
  });
});
