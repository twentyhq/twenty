import { useStore } from 'jotai';
import { getAgentChatMentionsResolvedAt } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { INBOX_THREAD_PARTICIPANT_UNSAVED_UPDATED_AT } from '@/ai/constants/InboxThreadParticipantUnsavedUpdatedAt';
import { useApplyInboxThreadUpdate } from '@/ai/hooks/useApplyInboxThreadUpdate';
import { inboxThreadParticipantsState } from '@/ai/states/inboxThreadParticipantsState';
import { inboxThreadVisitState } from '@/ai/states/inboxThreadVisitState';
import { inboxThreadRecordFamilySelector } from '@/ai/states/selectors/inboxThreadRecordFamilySelector';

// Mirrors what the server records when the member sends a message: the
// thread leaves the trash, moves to the top of their inbox and is caught up,
// so its unread line goes
export const useOptimisticallyRestoreOnSend = () => {
  const { applyInboxThreadUpdate } = useApplyInboxThreadUpdate();
  const store = useStore();

  const applyOptimisticRestore = ({
    threadId,
    optimisticUpdatedAt,
  }: {
    threadId: string;
    optimisticUpdatedAt: string;
  }): (() => void) => {
    const thread = store.get(
      inboxThreadRecordFamilySelector.selectorFamily(threadId),
    );
    const previousParticipant = store.get(inboxThreadParticipantsState.atom)?.[
      threadId
    ];
    const previousVisit = store.get(inboxThreadVisitState.atom);

    applyInboxThreadUpdate({
      id: threadId,
      lastActivityAt: optimisticUpdatedAt,
      ...(isDefined(thread?.deletedAt) && {
        deletedAt: null,
        updatedAt: optimisticUpdatedAt,
      }),
    });
    store.set(inboxThreadParticipantsState.atom, (participants) =>
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
                INBOX_THREAD_PARTICIPANT_UNSAVED_UPDATED_AT,
            },
          }
        : participants,
    );
    store.set(inboxThreadVisitState.atom, (visit) =>
      visit?.threadId === threadId
        ? { ...visit, isUnread: false, isKeptUnread: false }
        : visit,
    );
    const optimisticParticipant = store.get(
      inboxThreadParticipantsState.atom,
    )?.[threadId];

    return () => {
      applyInboxThreadUpdate({
        id: threadId,
        ...(isDefined(thread) && {
          lastActivityAt: thread.lastActivityAt,
          updatedAt: thread.updatedAt,
        }),
        ...(isDefined(thread?.deletedAt) && { deletedAt: thread.deletedAt }),
      });
      store.set(inboxThreadParticipantsState.atom, (participants) => {
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
      store.set(inboxThreadVisitState.atom, (visit) =>
        visit?.threadId === threadId ? previousVisit : visit,
      );
    };
  };

  return { applyOptimisticRestore };
};
