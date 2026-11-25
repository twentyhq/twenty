import { useStore } from 'jotai';
import { updateLoadedAiChatThreadParticipantRows } from '@/ai-chat/threads/utils/updateLoadedAiChatThreadParticipantRows';
import { getAgentChatMentionsResolvedAt } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { AI_CHAT_THREAD_PARTICIPANT_UNSAVED_UPDATED_AT } from '@/ai-chat/threads/constants/AiChatThreadParticipantUnsavedUpdatedAt';
import { useApplyAiChatThreadUpdate } from '@/ai-chat/threads/hooks/useApplyAiChatThreadUpdate';
import { aiChatThreadParticipantsState } from '@/ai-chat/threads/states/aiChatThreadParticipantsState';
import { aiChatThreadViewVisitFamilyState } from '@/ai-chat/states/view/aiChatThreadViewVisitFamilyState';
import { aiChatThreadRecordFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadRecordFamilySelector';

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
    const previousParticipant = store.get(aiChatThreadParticipantsState.atom)
      .rowsByThreadId[threadId];
    const visitAtom = aiChatThreadViewVisitFamilyState.atomFamily({ threadId });
    const previousVisit = store.get(visitAtom);

    applyAiChatThreadUpdate({
      id: threadId,
      lastActivityAt: optimisticUpdatedAt,
      ...(isDefined(thread?.deletedAt) && {
        deletedAt: null,
        updatedAt: optimisticUpdatedAt,
      }),
    });
    store.set(
      aiChatThreadParticipantsState.atom,
      updateLoadedAiChatThreadParticipantRows((rows) => ({
        ...rows,
        [threadId]: {
          ...rows[threadId],
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
      })),
    );
    store.set(visitAtom, (visit) =>
      isDefined(visit)
        ? { ...visit, isUnread: false, isKeptUnread: false }
        : visit,
    );
    const optimisticParticipant = store.get(aiChatThreadParticipantsState.atom)
      .rowsByThreadId[threadId];

    return () => {
      applyAiChatThreadUpdate({
        id: threadId,
        ...(isDefined(thread) && {
          lastActivityAt: thread.lastActivityAt,
          updatedAt: thread.updatedAt,
        }),
        ...(isDefined(thread?.deletedAt) && { deletedAt: thread.deletedAt }),
      });
      store.set(
        aiChatThreadParticipantsState.atom,
        updateLoadedAiChatThreadParticipantRows((rows) => {
          if (rows[threadId] !== optimisticParticipant) {
            return rows;
          }

          const { [threadId]: _sentParticipant, ...otherRows } = rows;

          return isDefined(previousParticipant)
            ? { ...otherRows, [threadId]: previousParticipant }
            : otherRows;
        }),
      );
      store.set(visitAtom, previousVisit);
    };
  };

  return { applyOptimisticRestore };
};
