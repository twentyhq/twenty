import { type TypedDocumentNode } from '@apollo/client';
import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
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
  type AgentChatThreadParticipantFieldsFragment,
  ArchiveAgentChatThreadDocument,
  MarkAgentChatThreadAsReadDocument,
  MarkAgentChatThreadAsUnreadDocument,
  MoveAgentChatThreadToInboxDocument,
  SnoozeAgentChatThreadDocument,
} from '~/generated-metadata/graphql';

export const useAgentChatThreadParticipants = () => {
  const client = useApolloClient();
  const store = useStore();
  const { enqueueToast } = useToast();

  // The change shows right away, and is put back if the server refuses it
  const updateParticipant = useCallback(
    async <TVariables extends { threadId: string }>({
      mutation,
      variables,
      optimisticParticipant,
      optimisticVisit,
    }: {
      mutation: TypedDocumentNode<unknown, TVariables>;
      variables: TVariables;
      optimisticParticipant: Partial<AgentChatThreadParticipantFieldsFragment>;
      optimisticVisit?: Partial<AgentChatThreadVisit>;
    }) => {
      const { threadId } = variables;
      const previousVisit = store.get(agentChatThreadVisitState.atom);
      const previousParticipant = store.get(
        agentChatThreadParticipantsState.atom,
      )?.[threadId];

      if (isDefined(optimisticVisit)) {
        store.set(agentChatThreadVisitState.atom, (visit) =>
          visit?.threadId === threadId
            ? { ...visit, ...optimisticVisit }
            : visit,
        );
      }

      store.set(agentChatThreadParticipantsState.atom, (participants) =>
        isDefined(participants)
          ? {
              ...participants,
              [threadId]: {
                ...participants[threadId],
                ...optimisticParticipant,
                threadId,
              },
            }
          : participants,
      );
      const optimisticEntry = store.get(
        agentChatThreadParticipantsState.atom,
      )?.[threadId];

      try {
        await client.mutate({ mutation, variables });
      } catch (error) {
        enqueueToast(getToastOptionsFromError({ error }));

        if (isDefined(optimisticVisit)) {
          store.set(agentChatThreadVisitState.atom, (visit) =>
            visit?.threadId === threadId ? previousVisit : visit,
          );
        }

        // A newer row may have arrived since, and is kept
        store.set(agentChatThreadParticipantsState.atom, (participants) => {
          if (
            !isDefined(participants) ||
            participants[threadId] !== optimisticEntry
          ) {
            return participants;
          }

          const { [threadId]: _optimisticEntry, ...otherParticipants } =
            participants;

          return isDefined(previousParticipant)
            ? { ...otherParticipants, [threadId]: previousParticipant }
            : otherParticipants;
        });
      }
    },
    [client, enqueueToast, store],
  );

  const markAgentChatThreadAsRead = useCallback(
    (threadId: string) =>
      updateParticipant({
        mutation: MarkAgentChatThreadAsReadDocument,
        variables: { threadId },
        optimisticParticipant: {
          lastReadAt:
            store.get(
              agentChatThreadRecordFamilySelector.selectorFamily(threadId),
            )?.lastActivityAt ?? null,
        },
        optimisticVisit: { isKeptUnread: false },
      }),
    [store, updateParticipant],
  );

  // On the thread on screen, it stays unread until the member leaves it, and
  // its unread line moves to the first message from someone else
  const markAgentChatThreadAsUnread = useCallback(
    (threadId: string) =>
      updateParticipant({
        mutation: MarkAgentChatThreadAsUnreadDocument,
        variables: { threadId },
        optimisticParticipant: { lastReadAt: null },
        optimisticVisit: {
          isKeptUnread: true,
          isUnread: true,
          lastReadAt: null,
        },
      }),
    [updateParticipant],
  );

  const archiveAgentChatThread = useCallback(
    (threadId: string) =>
      updateParticipant({
        mutation: ArchiveAgentChatThreadDocument,
        variables: { threadId },
        optimisticParticipant: {
          archivedAt: new Date().toISOString(),
          snoozedUntil: null,
        },
      }),
    [updateParticipant],
  );

  const snoozeAgentChatThreads = useCallback(
    async ({
      threadIds,
      snoozedUntil,
    }: {
      threadIds: string[];
      snoozedUntil: Date;
    }) => {
      await Promise.all(
        threadIds.map((threadId) =>
          updateParticipant({
            mutation: SnoozeAgentChatThreadDocument,
            variables: { threadId, snoozedUntil: snoozedUntil.toISOString() },
            optimisticParticipant: {
              archivedAt: new Date().toISOString(),
              snoozedUntil: snoozedUntil.toISOString(),
            },
          }),
        ),
      );
    },
    [updateParticipant],
  );

  const moveAgentChatThreadToInbox = useCallback(
    (threadId: string) =>
      updateParticipant({
        mutation: MoveAgentChatThreadToInboxDocument,
        variables: { threadId },
        optimisticParticipant: { archivedAt: null, snoozedUntil: null },
      }),
    [updateParticipant],
  );

  return {
    markAgentChatThreadAsRead,
    markAgentChatThreadAsUnread,
    archiveAgentChatThread,
    snoozeAgentChatThreads,
    moveAgentChatThreadToInbox,
  };
};
