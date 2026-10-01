import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { type AgentChatThreadParticipantState } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useAgentChatThreadParticipantSync } from '@/ai/hooks/useAgentChatThreadParticipantSync';
import { useApplyAgentChatThreadUpdate } from '@/ai/hooks/useApplyAgentChatThreadUpdate';
import { agentChatThreadKeptUnreadIdState } from '@/ai/states/agentChatThreadKeptUnreadIdState';
import { agentChatThreadParticipantSyncState } from '@/ai/states/agentChatThreadParticipantSyncState';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatThreadUnreadSinceState } from '@/ai/states/agentChatThreadUnreadSinceState';
import { agentChatViewedThreadIdState } from '@/ai/states/agentChatViewedThreadIdState';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { hasLoadedAgentChatThreadParticipantsState } from '@/ai/states/hasLoadedAgentChatThreadParticipantsState';
import { AGENT_CHAT_THREAD_PARTICIPANT_EMPTY_SYNC } from '@/ai/constants/AgentChatThreadParticipantEmptySync';
import { toAgentChatThreadParticipantState } from '@/ai/utils/toAgentChatThreadParticipantState';
import {
  ArchiveAgentChatThreadDocument,
  GetMyAgentChatThreadParticipantsDocument,
  MarkAgentChatThreadAsReadDocument,
  MarkAgentChatThreadAsUnreadDocument,
  MoveAgentChatThreadToInboxDocument,
  SnoozeAgentChatThreadDocument,
} from '~/generated-metadata/graphql';

const noop = () => {};

export const useAgentChatThreadParticipants = () => {
  const client = useApolloClient();
  const store = useStore();
  const { applyAgentChatThreadUpdate } = useApplyAgentChatThreadUpdate();
  const { setParticipantState, getSync, bumpVersion, updateParticipant } =
    useAgentChatThreadParticipantSync();

  const refreshAgentChatThreadParticipants = useCallback(async () => {
    const syncsBeforeRequest = store.get(
      agentChatThreadParticipantSyncState.atom,
    );
    const result = await client
      .query({
        query: GetMyAgentChatThreadParticipantsDocument,
        fetchPolicy: 'network-only',
      })
      .catch(() => undefined);

    if (!isDefined(result?.data)) {
      return;
    }

    const fetchedParticipants: Record<string, AgentChatThreadParticipantState> =
      Object.fromEntries(
        result.data.myAgentChatThreadParticipants.map((participant) => [
          participant.threadId,
          toAgentChatThreadParticipantState(participant),
        ]),
      );
    const localParticipants = store.get(agentChatThreadParticipantsState.atom);
    const hasLocalChange = (threadId: string) => {
      const sync = getSync(threadId);

      return (
        sync.pendingRequestCount > 0 ||
        sync.version !==
          (
            syncsBeforeRequest[threadId] ??
            AGENT_CHAT_THREAD_PARTICIPANT_EMPTY_SYNC
          ).version
      );
    };

    const mergedParticipants = Object.fromEntries(
      [
        ...new Set([
          ...Object.keys(fetchedParticipants),
          ...Object.keys(localParticipants),
        ]),
      ]
        .map((threadId) => [
          threadId,
          hasLocalChange(threadId)
            ? localParticipants[threadId]
            : fetchedParticipants[threadId],
        ])
        .filter(([, participant]) => isDefined(participant)),
    );

    store.set(hasLoadedAgentChatThreadParticipantsState.atom, true);
    store.set(agentChatThreadParticipantsState.atom, mergedParticipants);
  }, [client, getSync, store]);

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
        threadId,
        optimisticState: { lastReadAt: thread?.lastActivityAt ?? null },
        applyLocalState: () => releaseKeptUnreadThread(threadId) ?? noop,
        mutate: async () =>
          (
            await client.mutate({
              mutation: MarkAgentChatThreadAsReadDocument,
              variables: { threadId },
            })
          ).data?.markAgentChatThreadAsRead,
      });
    },
    [client, releaseKeptUnreadThread, store, updateParticipant],
  );

  // On the thread on screen, it stays unread until the member leaves it, and
  // its unread line moves to the first message from someone else
  const keepViewedThreadUnread = useCallback(
    (threadId: string) => {
      if (store.get(agentChatViewedThreadIdState.atom) !== threadId) {
        return noop;
      }

      const rollbackKeptUnreadThreadId = setKeptUnreadThreadId(threadId);
      const previousUnreadSince = store.get(
        agentChatThreadUnreadSinceState.atom,
      );

      if (previousUnreadSince?.threadId === threadId) {
        store.set(agentChatThreadUnreadSinceState.atom, {
          ...previousUnreadSince,
          isUnread: true,
          lastReadAt: null,
        });
      }

      return () => {
        rollbackKeptUnreadThreadId();

        if (
          store.get(agentChatThreadUnreadSinceState.atom)?.threadId === threadId
        ) {
          store.set(agentChatThreadUnreadSinceState.atom, previousUnreadSince);
        }
      };
    },
    [setKeptUnreadThreadId, store],
  );

  const markAgentChatThreadAsUnread = useCallback(
    (threadId: string) =>
      updateParticipant({
        threadId,
        optimisticState: { lastReadAt: null },
        applyLocalState: () => keepViewedThreadUnread(threadId),
        mutate: async () =>
          (
            await client.mutate({
              mutation: MarkAgentChatThreadAsUnreadDocument,
              variables: { threadId },
            })
          ).data?.markAgentChatThreadAsUnread,
      }),
    [client, keepViewedThreadUnread, updateParticipant],
  );

  const archiveAgentChatThread = useCallback(
    (threadId: string) =>
      updateParticipant({
        threadId,
        optimisticState: {
          archivedAt: new Date().toISOString(),
          snoozedUntil: null,
        },
        mutate: async () =>
          (
            await client.mutate({
              mutation: ArchiveAgentChatThreadDocument,
              variables: { threadId },
            })
          ).data?.archiveAgentChatThread,
      }),
    [client, updateParticipant],
  );

  const snoozeAgentChatThread = useCallback(
    (threadId: string, snoozedUntil: Date) =>
      updateParticipant({
        threadId,
        optimisticState: {
          archivedAt: new Date().toISOString(),
          snoozedUntil: snoozedUntil.toISOString(),
        },
        mutate: async () =>
          (
            await client.mutate({
              mutation: SnoozeAgentChatThreadDocument,
              variables: {
                threadId,
                snoozedUntil: snoozedUntil.toISOString(),
              },
            })
          ).data?.snoozeAgentChatThread,
      }),
    [client, updateParticipant],
  );

  const moveAgentChatThreadToInbox = useCallback(
    (threadId: string) =>
      updateParticipant({
        threadId,
        optimisticState: { archivedAt: null, snoozedUntil: null },
        mutate: async () =>
          (
            await client.mutate({
              mutation: MoveAgentChatThreadToInboxDocument,
              variables: { threadId },
            })
          ).data?.moveAgentChatThreadToInbox,
      }),
    [client, updateParticipant],
  );

  // Mirrors what the server records when the member sends a message, so the
  // thread moves to the top of their inbox without waiting for the event
  const applyLocalMemberActivity = useCallback(
    (threadId: string, activityAt: string) => {
      const previousThread = store.get(
        agentChatThreadRecordFamilySelector.selectorFamily(threadId),
      );
      const previousState = store.get(agentChatThreadParticipantsState.atom)[
        threadId
      ];

      // Writing in a thread catches the member up, so its unread line goes
      const previousUnreadSince = store.get(
        agentChatThreadUnreadSinceState.atom,
      );

      if (previousUnreadSince?.threadId === threadId) {
        store.set(agentChatThreadUnreadSinceState.atom, {
          ...previousUnreadSince,
          isUnread: false,
        });
      }
      const rollbackKeptUnreadThread = releaseKeptUnreadThread(threadId);
      const version = bumpVersion(threadId);

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

        if (getSync(threadId).version === version) {
          setParticipantState(threadId, previousState);
        }

        if (
          store.get(agentChatThreadUnreadSinceState.atom)?.threadId === threadId
        ) {
          store.set(agentChatThreadUnreadSinceState.atom, previousUnreadSince);
        }
      };
    },
    [
      applyAgentChatThreadUpdate,
      bumpVersion,
      getSync,
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
