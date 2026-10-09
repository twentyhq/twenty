import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_THREAD_PARTICIPANT_UNSAVED_UPDATED_AT } from '@/ai/constants/AgentChatThreadParticipantUnsavedUpdatedAt';
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

  const applyOptimisticRestore = ({
    threadId,
    optimisticUpdatedAt,
  }: {
    threadId: string;
    optimisticUpdatedAt: string;
  }): (() => void) => {
    const thread = store.get(
      agentChatThreadRecordFamilySelector.selectorFamily(threadId),
    );
    const previousParticipant = store.get(
      agentChatThreadParticipantsState.atom,
    )?.[threadId];
    const previousVisit = store.get(agentChatThreadVisitState.atom);

    // Workspaces not yet upgraded to 2.46 have no last activity and sort by
    // the last change
    const hasLastActivityAt = thread?.lastActivityAt !== undefined;

    applyAgentChatThreadUpdate({
      id: threadId,
      ...(hasLastActivityAt
        ? { lastActivityAt: optimisticUpdatedAt }
        : { updatedAt: optimisticUpdatedAt }),
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
              ...participants[threadId],
              threadId,
              lastReadAt: optimisticUpdatedAt,
              archivedAt: null,
              snoozedUntil: null,
              isSubscribed: true,
              updatedAt:
                previousParticipant?.updatedAt ??
                AGENT_CHAT_THREAD_PARTICIPANT_UNSAVED_UPDATED_AT,
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
        ...(hasLastActivityAt && { lastActivityAt: thread.lastActivityAt }),
        ...(isDefined(thread) && { updatedAt: thread.updatedAt }),
        ...(isDefined(thread?.deletedAt) && { deletedAt: thread.deletedAt }),
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
