import { type TypedDocumentNode } from '@apollo/client';
import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components';

import { type AgentChatThreadParticipantState } from '@/ai/types/AgentChatThreadParticipantState';
import { useApplyAgentChatThreadUpdate } from '@/ai/hooks/useApplyAgentChatThreadUpdate';
import { agentChatThreadKeptUnreadIdState } from '@/ai/states/agentChatThreadKeptUnreadIdState';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import {
  type AgentChatThreadUnreadSince,
  agentChatThreadUnreadSinceState,
} from '@/ai/states/agentChatThreadUnreadSinceState';
import { agentChatViewedThreadIdState } from '@/ai/states/agentChatViewedThreadIdState';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { hasLoadedAgentChatThreadParticipantsState } from '@/ai/states/hasLoadedAgentChatThreadParticipantsState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import {
  ArchiveAgentChatThreadDocument,
  GetMyAgentChatThreadParticipantsDocument,
  MarkAgentChatThreadAsReadDocument,
  MarkAgentChatThreadAsUnreadDocument,
  MoveAgentChatThreadToInboxDocument,
  SnoozeAgentChatThreadDocument,
} from '~/generated-metadata/graphql';

const EMPTY_PARTICIPANT_STATE: AgentChatThreadParticipantState = {
  lastReadAt: null,
  archivedAt: null,
  snoozedUntil: null,
};

export const useAgentChatThreadParticipants = () => {
  const client = useApolloClient();
  const store = useStore();
  const { applyAgentChatThreadUpdate } = useApplyAgentChatThreadUpdate();
  const { enqueueToast } = useToast();

  const setParticipantState = useCallback(
    (threadId: string, state: AgentChatThreadParticipantState | undefined) => {
      store.set(agentChatThreadParticipantsState.atom, (participants) => {
        const { [threadId]: _previousState, ...otherParticipants } =
          participants;

        return isDefined(state)
          ? { ...otherParticipants, [threadId]: state }
          : otherParticipants;
      });
    },
    [store],
  );

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

    store.set(hasLoadedAgentChatThreadParticipantsState.atom, true);
    store.set(
      agentChatThreadParticipantsState.atom,
      Object.fromEntries(
        result.data.myAgentChatThreadParticipants.map((participant) => [
          participant.threadId,
          {
            lastReadAt: participant.lastReadAt ?? null,
            archivedAt: participant.archivedAt ?? null,
            snoozedUntil: participant.snoozedUntil ?? null,
          },
        ]),
      ),
    );
  }, [client, store]);

  // The change shows right away; if the server refuses it, the member's
  // state is reloaded from the server
  const updateParticipant = useCallback(
    async <TVariables extends { threadId: string }>({
      mutation,
      variables,
      optimisticState,
      applyLocalState,
    }: {
      mutation: TypedDocumentNode<unknown, TVariables>;
      variables: TVariables;
      optimisticState: Partial<AgentChatThreadParticipantState>;
      applyLocalState?: () => (() => void) | undefined;
    }) => {
      const { threadId } = variables;
      const previousState = store.get(agentChatThreadParticipantsState.atom)[
        threadId
      ];

      setParticipantState(threadId, {
        ...(previousState ?? EMPTY_PARTICIPANT_STATE),
        ...optimisticState,
      });
      const rollbackLocalState = applyLocalState?.();

      try {
        await client.mutate({ mutation, variables });
      } catch (error) {
        rollbackLocalState?.();
        enqueueToast(getToastOptionsFromError({ error }));
        await refreshAgentChatThreadParticipants();
      }
    },
    [
      client,
      enqueueToast,
      refreshAgentChatThreadParticipants,
      setParticipantState,
      store,
    ],
  );

  // The rollback leaves the unread line alone once another thread owns it
  const patchUnreadSince = useCallback(
    (threadId: string, patch: Partial<AgentChatThreadUnreadSince>) => {
      const previousUnreadSince = store.get(
        agentChatThreadUnreadSinceState.atom,
      );

      if (previousUnreadSince?.threadId === threadId) {
        store.set(agentChatThreadUnreadSinceState.atom, {
          ...previousUnreadSince,
          ...patch,
        });
      }

      return () => {
        if (
          store.get(agentChatThreadUnreadSinceState.atom)?.threadId === threadId
        ) {
          store.set(agentChatThreadUnreadSinceState.atom, previousUnreadSince);
        }
      };
    },
    [store],
  );

  const setKeptUnreadThreadId = useCallback(
    (threadId: string | null) => {
      const previousKeptUnreadThreadId = store.get(
        agentChatThreadKeptUnreadIdState.atom,
      );

      store.set(agentChatThreadKeptUnreadIdState.atom, threadId);

      return () =>
        store.set(
          agentChatThreadKeptUnreadIdState.atom,
          previousKeptUnreadThreadId,
        );
    },
    [store],
  );

  const releaseKeptUnreadThread = useCallback(
    (threadId: string) =>
      store.get(agentChatThreadKeptUnreadIdState.atom) === threadId
        ? setKeptUnreadThreadId(null)
        : undefined,
    [setKeptUnreadThreadId, store],
  );

  const markAgentChatThreadAsRead = useCallback(
    (threadId: string) => {
      const thread = store.get(
        agentChatThreadRecordFamilySelector.selectorFamily(threadId),
      );

      return updateParticipant({
        mutation: MarkAgentChatThreadAsReadDocument,
        variables: { threadId },
        optimisticState: { lastReadAt: thread?.lastActivityAt ?? null },
        applyLocalState: () => releaseKeptUnreadThread(threadId),
      });
    },
    [releaseKeptUnreadThread, store, updateParticipant],
  );

  // On the thread on screen, it stays unread until the member leaves it, and
  // its unread line moves to the first message from someone else
  const keepViewedThreadUnread = useCallback(
    (threadId: string) => {
      if (store.get(agentChatViewedThreadIdState.atom) !== threadId) {
        return undefined;
      }

      const rollbackKeptUnreadThreadId = setKeptUnreadThreadId(threadId);
      const rollbackUnreadSince = patchUnreadSince(threadId, {
        isUnread: true,
        lastReadAt: null,
      });

      return () => {
        rollbackKeptUnreadThreadId();
        rollbackUnreadSince();
      };
    },
    [patchUnreadSince, setKeptUnreadThreadId, store],
  );

  const markAgentChatThreadAsUnread = useCallback(
    (threadId: string) =>
      updateParticipant({
        mutation: MarkAgentChatThreadAsUnreadDocument,
        variables: { threadId },
        optimisticState: { lastReadAt: null },
        applyLocalState: () => keepViewedThreadUnread(threadId),
      }),
    [keepViewedThreadUnread, updateParticipant],
  );

  const archiveAgentChatThread = useCallback(
    (threadId: string) =>
      updateParticipant({
        mutation: ArchiveAgentChatThreadDocument,
        variables: { threadId },
        optimisticState: {
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
        optimisticState: {
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
        optimisticState: { archivedAt: null, snoozedUntil: null },
      }),
    [updateParticipant],
  );

  // Mirrors what the server records when the member sends a message, so the
  // thread moves to the top of their inbox without waiting for the event
  const applyLocalMemberActivity = useCallback(
    ({ threadId, activityAt }: { threadId: string; activityAt: string }) => {
      const previousThread = store.get(
        agentChatThreadRecordFamilySelector.selectorFamily(threadId),
      );
      const previousState = store.get(agentChatThreadParticipantsState.atom)[
        threadId
      ];

      // Writing in a thread catches the member up, so its unread line goes
      const rollbackUnreadSince = patchUnreadSince(threadId, {
        isUnread: false,
      });
      const rollbackKeptUnreadThread = releaseKeptUnreadThread(threadId);

      applyAgentChatThreadUpdate({ id: threadId, lastActivityAt: activityAt });
      setParticipantState(threadId, {
        lastReadAt: activityAt,
        archivedAt: null,
        snoozedUntil: null,
      });

      return () => {
        applyAgentChatThreadUpdate({
          id: threadId,
          lastActivityAt: previousThread?.lastActivityAt ?? null,
        });
        rollbackKeptUnreadThread?.();

        setParticipantState(threadId, previousState);
        rollbackUnreadSince();
      };
    },
    [
      applyAgentChatThreadUpdate,
      patchUnreadSince,
      releaseKeptUnreadThread,
      setParticipantState,
      store,
    ],
  );

  return {
    refreshAgentChatThreadParticipants,
    markAgentChatThreadAsRead,
    markAgentChatThreadAsUnread,
    archiveAgentChatThread,
    snoozeAgentChatThread,
    moveAgentChatThreadToInbox,
    applyLocalMemberActivity,
  };
};
