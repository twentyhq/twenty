import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { applyAgentChatInboxAction } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { inboxReopenedThreadActivityState } from '@/ai/states/agentChatReopenedThreadActivityState';
import { inboxThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import {
  type InboxThreadVisit,
  inboxThreadVisitState,
} from '@/ai/states/agentChatThreadVisitState';
import { inboxThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import {
  AgentChatInboxAction,
  UpdateAgentChatThreadInboxStateDocument,
} from '~/generated-metadata/graphql';

// On the thread on screen, a chat marked unread stays unread until the member
// leaves it, and its unread line moves to the first message from someone else
const OPTIMISTIC_VISIT_BY_ACTION: Partial<
  Record<AgentChatInboxAction, Partial<InboxThreadVisit>>
> = {
  [AgentChatInboxAction.READ]: { isKeptUnread: false },
  [AgentChatInboxAction.UNREAD]: {
    isKeptUnread: true,
    isUnread: true,
    lastReadAt: null,
  },
};

export const useUpdateInboxThreadStatus = () => {
  const client = useApolloClient();
  const store = useStore();
  const { enqueueToast } = useToast();

  // The change shows right away, and is put back if the server refuses it
  const updateAgentChatThreadInboxState = useCallback(
    async ({
      threadIds,
      action,
      snoozedUntil,
    }: {
      threadIds: string[];
      action: AgentChatInboxAction;
      snoozedUntil?: Date;
    }) => {
      const now = new Date();
      const optimisticVisit = OPTIMISTIC_VISIT_BY_ACTION[action];
      const previousVisit = store.get(inboxThreadVisitState.atom);
      const previousParticipants = store.get(inboxThreadParticipantsState.atom);

      if (
        isDefined(optimisticVisit) &&
        isDefined(previousVisit) &&
        threadIds.includes(previousVisit.threadId)
      ) {
        store.set(inboxThreadVisitState.atom, {
          ...previousVisit,
          ...optimisticVisit,
        });
      }
      const optimisticVisitState = store.get(inboxThreadVisitState.atom);
      const getThreadLastActivityAt = (threadId: string) =>
        store.get(inboxThreadRecordFamilySelector.selectorFamily(threadId))
          ?.lastActivityAt ?? null;

      if (action === AgentChatInboxAction.MOVE_TO_INBOX) {
        store.set(
          inboxReopenedThreadActivityState.atom,
          (reopenedThreadActivity) => ({
            ...reopenedThreadActivity,
            ...Object.fromEntries(
              threadIds.map((threadId) => [
                threadId,
                getThreadLastActivityAt(threadId),
              ]),
            ),
          }),
        );
      }

      store.set(inboxThreadParticipantsState.atom, (participants) => {
        if (!isDefined(participants)) {
          return participants;
        }

        const updatedParticipants = { ...participants };

        for (const threadId of threadIds) {
          updatedParticipants[threadId] = {
            ...participants[threadId],
            ...applyAgentChatInboxAction({
              participant: participants[threadId],
              action,
              now,
              threadLastActivityAt: getThreadLastActivityAt(threadId),
              snoozedUntil: snoozedUntil?.toISOString(),
            }),
            threadId,
          };
        }

        return updatedParticipants;
      });
      const optimisticParticipants = store.get(
        inboxThreadParticipantsState.atom,
      );

      try {
        await client.mutate({
          mutation: UpdateAgentChatThreadInboxStateDocument,
          variables: {
            threadIds,
            action,
            snoozedUntil: snoozedUntil?.toISOString(),
          },
        });
      } catch (error) {
        enqueueToast(getToastOptionsFromError({ error }));

        // A visit to another chat since then is kept
        store.set(inboxThreadVisitState.atom, (visit) =>
          visit === optimisticVisitState ? previousVisit : visit,
        );

        // A newer row may have arrived since, and is kept
        store.set(inboxThreadParticipantsState.atom, (participants) => {
          if (!isDefined(participants)) {
            return participants;
          }

          const restoredParticipants = { ...participants };

          for (const threadId of threadIds) {
            if (participants[threadId] !== optimisticParticipants?.[threadId]) {
              continue;
            }

            const previousParticipant = previousParticipants?.[threadId];

            if (isDefined(previousParticipant)) {
              restoredParticipants[threadId] = previousParticipant;
            } else {
              delete restoredParticipants[threadId];
            }
          }

          return restoredParticipants;
        });
      }
    },
    [client, enqueueToast, store],
  );

  return { updateAgentChatThreadInboxState };
};
