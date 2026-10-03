import { type TypedDocumentNode } from '@apollo/client';
import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components';

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
  GetMyAgentChatThreadParticipantsDocument,
  MarkAgentChatThreadAsReadDocument,
  MarkAgentChatThreadAsUnreadDocument,
  MoveAgentChatThreadToInboxDocument,
  SnoozeAgentChatThreadDocument,
} from '~/generated-metadata/graphql';

export const useAgentChatThreadParticipants = () => {
  const client = useApolloClient();
  const store = useStore();
  const { enqueueToast } = useToast();

  const loadAgentChatThreadParticipants = useCallback(
    async (threadIds: string[]): Promise<boolean> => {
      const participantsBeforeRequest = store.get(
        agentChatThreadParticipantsState.atom,
      );
      const result = isNonEmptyArray(threadIds)
        ? await client
            .query({
              query: GetMyAgentChatThreadParticipantsDocument,
              variables: { threadIds },
              fetchPolicy: 'network-only',
            })
            .catch(() => undefined)
        : { data: { myAgentChatThreadParticipants: [] } };

      if (!isDefined(result?.data)) {
        return false;
      }

      const loadedParticipantByThreadId = new Map(
        result.data.myAgentChatThreadParticipants.map((participant) => [
          participant.threadId,
          participant,
        ]),
      );

      store.set(agentChatThreadParticipantsState.atom, (participants) => {
        const nextParticipants = { ...participants };

        for (const threadId of threadIds) {
          // a chat changed here while the request ran keeps its newer state
          if (
            participants?.[threadId] !== participantsBeforeRequest?.[threadId]
          ) {
            continue;
          }

          const loadedParticipant = loadedParticipantByThreadId.get(threadId);

          if (isDefined(loadedParticipant)) {
            nextParticipants[threadId] = loadedParticipant;
          } else {
            delete nextParticipants[threadId];
          }
        }

        return nextParticipants;
      });

      return true;
    },
    [client, store],
  );

  // The change shows right away; if the server refuses it, the visit is put
  // back and the chat's state is reloaded from the server
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

      try {
        await client.mutate({ mutation, variables });
      } catch (error) {
        enqueueToast(getToastOptionsFromError({ error }));

        if (isDefined(optimisticVisit)) {
          store.set(agentChatThreadVisitState.atom, (visit) =>
            visit?.threadId === threadId ? previousVisit : visit,
          );
        }

        await loadAgentChatThreadParticipants([threadId]);
      }
    },
    [client, enqueueToast, loadAgentChatThreadParticipants, store],
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

  // A failed update only reloads its own chat, so the chats are snoozed together
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
    loadAgentChatThreadParticipants,
    markAgentChatThreadAsRead,
    markAgentChatThreadAsUnread,
    archiveAgentChatThread,
    snoozeAgentChatThreads,
    moveAgentChatThreadToInbox,
  };
};
