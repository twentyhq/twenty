import { type TypedDocumentNode } from '@apollo/client';
import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components';

import { agentChatThreadParticipantsLoadCountState } from '@/ai/states/agentChatThreadParticipantsLoadCountState';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatThreadStreamedParticipantsState } from '@/ai/states/agentChatThreadStreamedParticipantsState';
import {
  type AgentChatThreadVisit,
  agentChatThreadVisitState,
} from '@/ai/states/agentChatThreadVisitState';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { mergeAgentChatThreadParticipants } from '@/ai/utils/mergeAgentChatThreadParticipants';
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
    const loadCount =
      store.get(agentChatThreadParticipantsLoadCountState.atom) + 1;

    store.set(agentChatThreadParticipantsLoadCountState.atom, loadCount);
    store.set(agentChatThreadStreamedParticipantsState.atom, {});

    const result = await client
      .query({
        query: GetMyAgentChatThreadParticipantsDocument,
        fetchPolicy: 'network-only',
      })
      .catch(() => undefined);

    if (
      !isDefined(result?.data) ||
      store.get(agentChatThreadParticipantsLoadCountState.atom) !== loadCount
    ) {
      return;
    }

    store.set(
      agentChatThreadParticipantsState.atom,
      mergeAgentChatThreadParticipants(
        Object.fromEntries(
          result.data.myAgentChatThreadParticipants.map((participant) => [
            participant.threadId,
            participant,
          ]),
        ),
        Object.values(store.get(agentChatThreadStreamedParticipantsState.atom)),
      ),
    );
  }, [client, store]);

  // The change shows right away; if the server refuses it, the visit is put
  // back and the member's state is reloaded from the server
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

        await refreshAgentChatThreadParticipants();
      }
    },
    [client, enqueueToast, refreshAgentChatThreadParticipants, store],
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

  // One chat at a time: a failed update reloads every chat's state, which
  // would undo the optimistic change of an update still on its way
  const snoozeAgentChatThreads = useCallback(
    async ({
      threadIds,
      snoozedUntil,
    }: {
      threadIds: string[];
      snoozedUntil: Date;
    }) => {
      for (const threadId of threadIds) {
        await updateParticipant({
          mutation: SnoozeAgentChatThreadDocument,
          variables: { threadId, snoozedUntil: snoozedUntil.toISOString() },
          optimisticParticipant: {
            archivedAt: new Date().toISOString(),
            snoozedUntil: snoozedUntil.toISOString(),
          },
        });
      }
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
    refreshAgentChatThreadParticipants,
    markAgentChatThreadAsRead,
    markAgentChatThreadAsUnread,
    archiveAgentChatThread,
    snoozeAgentChatThreads,
    moveAgentChatThreadToInbox,
  };
};
