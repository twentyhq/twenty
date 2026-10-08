import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { applyAgentChatInboxAction } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import {
  type AgentChatThreadVisit,
  agentChatThreadVisitState,
} from '@/ai/states/agentChatThreadVisitState';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import {
  AgentChatInboxAction,
  UpdateAgentChatThreadInboxStateDocument,
} from '~/generated-metadata/graphql';

// On the thread on screen, a chat marked unread stays unread until the member
// leaves it, and its unread line moves to the first message from someone else
const OPTIMISTIC_VISIT_BY_ACTION: Partial<
  Record<AgentChatInboxAction, Partial<AgentChatThreadVisit>>
> = {
  [AgentChatInboxAction.READ]: { isKeptUnread: false },
  [AgentChatInboxAction.UNREAD]: {
    isKeptUnread: true,
    isUnread: true,
    lastReadAt: null,
  },
};

export const useUpdateAgentChatThreadInboxState = () => {
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
      const previousVisit = store.get(agentChatThreadVisitState.atom);
      const previousParticipants = store.get(
        agentChatThreadParticipantsState.atom,
      );

      if (
        isDefined(optimisticVisit) &&
        isDefined(previousVisit) &&
        threadIds.includes(previousVisit.threadId)
      ) {
        store.set(agentChatThreadVisitState.atom, {
          ...previousVisit,
          ...optimisticVisit,
        });
      }
      const optimisticVisitState = store.get(agentChatThreadVisitState.atom);

      store.set(agentChatThreadParticipantsState.atom, (participants) => {
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
              threadLastActivityAt:
                store.get(
                  agentChatThreadRecordFamilySelector.selectorFamily(threadId),
                )?.lastActivityAt ?? null,
              snoozedUntil: snoozedUntil?.toISOString(),
            }),
            threadId,
          };
        }

        return updatedParticipants;
      });
      const optimisticParticipants = store.get(
        agentChatThreadParticipantsState.atom,
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
        store.set(agentChatThreadVisitState.atom, (visit) =>
          visit === optimisticVisitState ? previousVisit : visit,
        );

        // A newer row may have arrived since, and is kept
        store.set(agentChatThreadParticipantsState.atom, (participants) => {
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
