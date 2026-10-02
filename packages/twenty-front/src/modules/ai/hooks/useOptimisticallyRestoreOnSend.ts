import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import { useApplyAgentChatThreadUpdate } from '@/ai/hooks/useApplyAgentChatThreadUpdate';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatThreadVisitState } from '@/ai/states/agentChatThreadVisitState';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';

// Mirrors what the server records when the member sends a message: the
// thread leaves the trash, moves to the top of their inbox and is caught up,
// so its unread line goes
export const useOptimisticallyRestoreOnSend = () => {
  const { applyAgentChatThreadUpdate } = useApplyAgentChatThreadUpdate();
  const store = useStore();

  const applyOptimisticRestore = (
    threadId: string,
    optimisticUpdatedAt: string,
  ): (() => void) => {
    const thread = store.get(
      agentChatThreadRecordFamilySelector.selectorFamily(threadId),
    );
    const previousParticipant = store.get(
      agentChatThreadParticipantsState.atom,
    )?.[threadId];
    const previousVisit = store.get(agentChatThreadVisitState.atom);

    applyAgentChatThreadUpdate({
      id: threadId,
      lastActivityAt: optimisticUpdatedAt,
      ...(isDefined(thread?.deletedAt) && {
        deletedAt: null,
        updatedAt: optimisticUpdatedAt,
      }),
    });
    store.set(agentChatThreadParticipantsState.atom, (participants) =>
      isDefined(participants)
        ? {
            ...participants,
            [threadId]: {
              threadId,
              lastReadAt: optimisticUpdatedAt,
              archivedAt: null,
              snoozedUntil: null,
            },
          }
        : participants,
    );
    store.set(agentChatThreadVisitState.atom, (visit) =>
      visit?.threadId === threadId
        ? { ...visit, isUnread: false, isKeptUnread: false }
        : visit,
    );

    return () => {
      applyAgentChatThreadUpdate({
        id: threadId,
        lastActivityAt: thread?.lastActivityAt ?? null,
        ...(isDefined(thread?.deletedAt) && {
          deletedAt: thread.deletedAt,
          updatedAt: thread.updatedAt,
        }),
      });
      store.set(agentChatThreadParticipantsState.atom, (participants) => {
        if (!isDefined(participants)) {
          return participants;
        }

        const { [threadId]: _sentParticipant, ...otherParticipants } =
          participants;

        return isDefined(previousParticipant)
          ? { ...otherParticipants, [threadId]: previousParticipant }
          : otherParticipants;
      });
      store.set(agentChatThreadVisitState.atom, (visit) =>
        visit?.threadId === threadId ? previousVisit : visit,
      );
    };
  };

  return { applyOptimisticRestore };
};
