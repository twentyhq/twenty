import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { type AgentChatThreadParticipantState } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components';

import { useApplyAgentChatThreadUpdate } from '@/ai/hooks/useApplyAgentChatThreadUpdate';
import { agentChatThreadKeptUnreadIdState } from '@/ai/states/agentChatThreadKeptUnreadIdState';
import {
  type AgentChatThreadParticipantSync,
  agentChatThreadParticipantSyncState,
} from '@/ai/states/agentChatThreadParticipantSyncState';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatThreadUnreadSinceState } from '@/ai/states/agentChatThreadUnreadSinceState';
import { agentChatViewedThreadIdState } from '@/ai/states/agentChatViewedThreadIdState';
import { hasLoadedAgentChatThreadParticipantsState } from '@/ai/states/hasLoadedAgentChatThreadParticipantsState';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import {
  type AgentChatThreadParticipantFieldsFragment,
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

const EMPTY_SYNC: AgentChatThreadParticipantSync = {
  version: 0,
  pendingRequestCount: 0,
};

const noop = () => {};

const toParticipantState = (
  participant: AgentChatThreadParticipantFieldsFragment,
): AgentChatThreadParticipantState => ({
  lastReadAt: participant.lastReadAt ?? null,
  archivedAt: participant.archivedAt ?? null,
  snoozedUntil: participant.snoozedUntil ?? null,
});

export const useAgentChatThreadParticipants = () => {
  const client = useApolloClient();
  const store = useStore();
  const { enqueueToast } = useToast();
  const { applyAgentChatThreadUpdate } = useApplyAgentChatThreadUpdate();

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

  const getSync = useCallback(
    (threadId: string) =>
      store.get(agentChatThreadParticipantSyncState.atom)[threadId] ??
      EMPTY_SYNC,
    [store],
  );

  const setSync = useCallback(
    (
      threadId: string,
      update: (
        sync: AgentChatThreadParticipantSync,
      ) => AgentChatThreadParticipantSync,
    ) => {
      store.set(agentChatThreadParticipantSyncState.atom, (syncs) => ({
        ...syncs,
        [threadId]: update(syncs[threadId] ?? EMPTY_SYNC),
      }));
    },
    [store],
  );

  const bumpVersion = useCallback(
    (threadId: string) => {
      setSync(threadId, (sync) => ({ ...sync, version: sync.version + 1 }));

      return getSync(threadId).version;
    },
    [getSync, setSync],
  );

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
          toParticipantState(participant),
        ]),
      );
    const localParticipants = store.get(agentChatThreadParticipantsState.atom);
    const hasLocalChange = (threadId: string) => {
      const sync = getSync(threadId);

      return (
        sync.pendingRequestCount > 0 ||
        sync.version !== (syncsBeforeRequest[threadId] ?? EMPTY_SYNC).version
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

  const updateParticipant = useCallback(
    async ({
      threadId,
      optimisticState,
      mutate,
      applyLocalState,
    }: {
      threadId: string;
      optimisticState: Partial<AgentChatThreadParticipantState>;
      mutate: () => Promise<
        AgentChatThreadParticipantFieldsFragment | undefined
      >;
      applyLocalState?: () => () => void;
    }) => {
      const previousState = store.get(agentChatThreadParticipantsState.atom)[
        threadId
      ];
      const version = bumpVersion(threadId);
      const isLatestChange = () => getSync(threadId).version === version;

      setSync(threadId, (sync) => ({
        ...sync,
        pendingRequestCount: sync.pendingRequestCount + 1,
      }));
      setParticipantState(threadId, {
        ...(previousState ?? EMPTY_PARTICIPANT_STATE),
        ...optimisticState,
      });
      const rollbackLocalState = applyLocalState?.();

      try {
        const participant = await mutate();

        if (isDefined(participant) && isLatestChange()) {
          setParticipantState(threadId, toParticipantState(participant));
        }
      } catch (error) {
        if (isLatestChange()) {
          setParticipantState(threadId, previousState);
          rollbackLocalState?.();
        }
        enqueueToast(getToastOptionsFromError({ error }));
      } finally {
        setSync(threadId, (sync) => ({
          ...sync,
          pendingRequestCount: sync.pendingRequestCount - 1,
        }));
      }
    },
    [bumpVersion, enqueueToast, getSync, setParticipantState, setSync, store],
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
      const thread = store.get(recordStoreFamilyState.atomFamily(threadId)) as
        | AgentChatThreadRecord
        | null
        | undefined;

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
        recordStoreFamilyState.atomFamily(threadId),
      ) as AgentChatThreadRecord | null | undefined;
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
