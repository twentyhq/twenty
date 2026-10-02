import { type TypedDocumentNode } from '@apollo/client';
import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
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

  const refreshAgentChatThreadParticipants = useCallback(async () => {
    const result = await client
      .query({
        query: GetMyAgentChatThreadParticipantsDocument,
        fetchPolicy: 'network-only',
      })
      .catch(() => undefined);

    if (!isDefined(result?.data)) {
      return;
    }

    store.set(
      agentChatThreadParticipantsState.atom,
      Object.fromEntries(
        result.data.myAgentChatThreadParticipants.map((participant) => [
          participant.threadId,
          participant,
        ]),
      ),
    );
  }, [client, store]);

  const updateVisit = useCallback(
    (threadId: string, update: Partial<AgentChatThreadVisit>) =>
      store.set(agentChatThreadVisitState.atom, (visit) =>
        visit?.threadId === threadId ? { ...visit, ...update } : visit,
      ),
    [store],
  );

  // The change shows right away; if the server refuses it, the member's
  // state is reloaded from the server
  const updateParticipant = useCallback(
    async <TVariables extends { threadId: string }>({
      mutation,
      variables,
      optimisticParticipant,
    }: {
      mutation: TypedDocumentNode<unknown, TVariables>;
      variables: TVariables;
      optimisticParticipant: Partial<AgentChatThreadParticipantFieldsFragment>;
    }) => {
      const { threadId } = variables;

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
        await refreshAgentChatThreadParticipants();
      }
    },
    [client, enqueueToast, refreshAgentChatThreadParticipants, store],
  );

  const markAgentChatThreadAsRead = useCallback(
    (threadId: string) => {
      updateVisit(threadId, { isKeptUnread: false });

      return updateParticipant({
        mutation: MarkAgentChatThreadAsReadDocument,
        variables: { threadId },
        optimisticParticipant: {
          lastReadAt:
            store.get(
              agentChatThreadRecordFamilySelector.selectorFamily(threadId),
            )?.lastActivityAt ?? null,
        },
      });
    },
    [store, updateParticipant, updateVisit],
  );

  // On the thread on screen, it stays unread until the member leaves it, and
  // its unread line moves to the first message from someone else
  const markAgentChatThreadAsUnread = useCallback(
    (threadId: string) => {
      updateVisit(threadId, {
        isKeptUnread: true,
        isUnread: true,
        lastReadAt: null,
      });

      return updateParticipant({
        mutation: MarkAgentChatThreadAsUnreadDocument,
        variables: { threadId },
        optimisticParticipant: { lastReadAt: null },
      });
    },
    [updateParticipant, updateVisit],
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

  const snoozeAgentChatThread = useCallback(
    ({ threadId, snoozedUntil }: { threadId: string; snoozedUntil: Date }) =>
      updateParticipant({
        mutation: SnoozeAgentChatThreadDocument,
        variables: { threadId, snoozedUntil: snoozedUntil.toISOString() },
        optimisticParticipant: {
          archivedAt: new Date().toISOString(),
          snoozedUntil: snoozedUntil.toISOString(),
        },
      }),
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
    refreshAgentChatThreadParticipants,
    markAgentChatThreadAsRead,
    markAgentChatThreadAsUnread,
    archiveAgentChatThread,
    snoozeAgentChatThread,
    moveAgentChatThreadToInbox,
  };
};
