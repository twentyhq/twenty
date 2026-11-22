import { useApolloClient } from '@apollo/client/react';
import { updateLoadedAiChatThreadParticipantRows } from '@/ai-chat/threads/utils/updateLoadedAiChatThreadParticipantRows';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { applyAgentChatInboxAction } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { aiChatReopenedThreadActivityState } from '@/ai-chat/threads/states/aiChatReopenedThreadActivityState';
import { aiChatThreadParticipantsState } from '@/ai-chat/threads/states/aiChatThreadParticipantsState';
import {
  type AiChatThreadVisit,
  aiChatThreadViewVisitFamilyState,
} from '@/ai-chat/states/view/aiChatThreadViewVisitFamilyState';
import { aiChatThreadRecordFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadRecordFamilySelector';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { closeAiChatThreadWebPushNotifications } from '@/ai-chat/threads/utils/closeAiChatThreadWebPushNotifications';
import {
  AgentChatInboxAction,
  UpdateAgentChatThreadInboxStateDocument,
} from '~/generated-metadata/graphql';
import { logError } from '~/utils/logError';

const OPTIMISTIC_VISIT_BY_ACTION: Partial<
  Record<AgentChatInboxAction, Partial<AiChatThreadVisit>>
> = {
  [AgentChatInboxAction.READ]: { isKeptUnread: false },
  [AgentChatInboxAction.UNREAD]: {
    isKeptUnread: true,
    isUnread: true,
    lastReadAt: null,
  },
};

export const useUpdateAiChatThreadInboxState = () => {
  const client = useApolloClient();
  const store = useStore();
  const { enqueueToast } = useToast();

  const updateAiChatThreadInboxState = useCallback(
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
      const previousParticipants = store.get(
        aiChatThreadParticipantsState.atom,
      ).rowsByThreadId;

      const visitUpdates = threadIds.map((threadId) => {
        const visitAtom = aiChatThreadViewVisitFamilyState.atomFamily({
          threadId,
        });
        const previousVisit = store.get(visitAtom);

        if (isDefined(optimisticVisit) && isDefined(previousVisit)) {
          store.set(visitAtom, { ...previousVisit, ...optimisticVisit });
        }

        return {
          visitAtom,
          previousVisit,
          optimisticVisitState: store.get(visitAtom),
        };
      });
      const getThreadLastActivityAt = (threadId: string) =>
        store.get(aiChatThreadRecordFamilySelector.selectorFamily(threadId))
          ?.lastActivityAt ?? null;

      if (
        action === AgentChatInboxAction.READ ||
        action === AgentChatInboxAction.ARCHIVE
      ) {
        closeAiChatThreadWebPushNotifications(threadIds).catch(logError);
      }

      if (action === AgentChatInboxAction.MOVE_TO_INBOX) {
        store.set(
          aiChatReopenedThreadActivityState.atom,
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

      store.set(
        aiChatThreadParticipantsState.atom,
        updateLoadedAiChatThreadParticipantRows((participants) => {
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
        }),
      );
      const optimisticParticipants = store.get(
        aiChatThreadParticipantsState.atom,
      ).rowsByThreadId;

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

        for (const {
          visitAtom,
          previousVisit,
          optimisticVisitState,
        } of visitUpdates) {
          store.set(visitAtom, (visit) =>
            visit === optimisticVisitState ? previousVisit : visit,
          );
        }

        store.set(
          aiChatThreadParticipantsState.atom,
          updateLoadedAiChatThreadParticipantRows((participants) => {
            const restoredParticipants = { ...participants };

            for (const threadId of threadIds) {
              if (participants[threadId] !== optimisticParticipants[threadId]) {
                continue;
              }

              const previousParticipant = previousParticipants[threadId];

              if (isDefined(previousParticipant)) {
                restoredParticipants[threadId] = previousParticipant;
              } else {
                delete restoredParticipants[threadId];
              }
            }

            return restoredParticipants;
          }),
        );
      }
    },
    [client, enqueueToast, store],
  );

  return { updateAiChatThreadInboxState };
};
