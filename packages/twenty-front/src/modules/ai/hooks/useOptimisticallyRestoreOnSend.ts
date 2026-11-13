import { useStore } from 'jotai';
import { getAgentChatMentionsResolvedAt } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { AI_CHAT_THREAD_PARTICIPANT_UNSAVED_UPDATED_AT } from '@/ai/constants/AgentChatThreadParticipantUnsavedUpdatedAt';
import { useApplyAiChatThreadUpdate } from '@/ai/hooks/useApplyAgentChatThreadUpdate';
import { aiChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { aiChatThreadVisitState } from '@/ai/states/agentChatThreadVisitState';
import { aiChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';

// Mirrors what the server records when the member sends a message: the
// thread leaves the trash, moves to the top of their inbox and is caught up,
// so its unread line goes
export const useOptimisticallyRestoreOnSend = () => {
  const { applyAiChatThreadUpdate } = useApplyAiChatThreadUpdate();
  const store = useStore();

  const applyOptimisticRestore = ({
    threadId,
    optimisticUpdatedAt,
  }: {
    threadId: string;
    optimisticUpdatedAt: string;
  }): (() => void) => {
    const thread = store.get(
      aiChatThreadRecordFamilySelector.selectorFamily(threadId),
    );
    const previousParticipant = store.get(aiChatThreadParticipantsState.atom)?.[
      threadId
    ];
    const previousVisit = store.get(aiChatThreadVisitState.atom);

    applyAiChatThreadUpdate({
      id: threadId,
      lastActivityAt: optimisticUpdatedAt,
      ...(isDefined(thread?.deletedAt) && {
        deletedAt: null,
        updatedAt: optimisticUpdatedAt,
      }),
    });
    store.set(aiChatThreadParticipantsState.atom, (participants) =>
      isDefined(participants)
        ? {
            ...participants,
            [threadId]: {
              ...participants[threadId],
              threadId,
              lastReadAt: optimisticUpdatedAt,
              mentionsResolvedAt: getAgentChatMentionsResolvedAt(
                previousParticipant ?? {},
              ),
              archivedAt: null,
              snoozedUntil: null,
              isSubscribed: true,
              updatedAt:
                previousParticipant?.updatedAt ??
                AI_CHAT_THREAD_PARTICIPANT_UNSAVED_UPDATED_AT,
            },
          }
        : participants,
    );
    store.set(aiChatThreadVisitState.atom, (visit) =>
      visit?.threadId === threadId
        ? { ...visit, isUnread: false, isKeptUnread: false }
        : visit,
    );
    const optimisticParticipant = store.get(
      aiChatThreadParticipantsState.atom,
    )?.[threadId];

    return () => {
      applyAiChatThreadUpdate({
        id: threadId,
        ...(isDefined(thread) && {
          lastActivityAt: thread.lastActivityAt,
          updatedAt: thread.updatedAt,
        }),
        ...(isDefined(thread?.deletedAt) && { deletedAt: thread.deletedAt }),
      });
      store.set(aiChatThreadParticipantsState.atom, (participants) => {
        if (
          !isDefined(participants) ||
          participants[threadId] !== optimisticParticipant
        ) {
          return participants;
        }

        const { [threadId]: _sentParticipant, ...otherParticipants } =
          participants;

        return isDefined(previousParticipant)
          ? { ...otherParticipants, [threadId]: previousParticipant }
          : otherParticipants;
      });
      store.set(aiChatThreadVisitState.atom, (visit) =>
        visit?.threadId === threadId ? previousVisit : visit,
      );
    };
  };

  return { applyOptimisticRestore };
};
