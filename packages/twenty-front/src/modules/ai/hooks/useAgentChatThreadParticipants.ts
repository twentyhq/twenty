import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { type AgentChatThreadParticipantState } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components';

import { useApplyAgentChatThreadUpdate } from '@/ai/hooks/useApplyAgentChatThreadUpdate';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
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
          toParticipantState(participant),
        ]),
      ),
    );
  }, [client, store]);

  const updateParticipant = useCallback(
    async ({
      threadId,
      optimisticState,
      mutate,
    }: {
      threadId: string;
      optimisticState: Partial<AgentChatThreadParticipantState>;
      mutate: () => Promise<
        AgentChatThreadParticipantFieldsFragment | undefined
      >;
    }) => {
      const previousState = store.get(agentChatThreadParticipantsState.atom)[
        threadId
      ];

      setParticipantState(threadId, {
        ...(previousState ?? EMPTY_PARTICIPANT_STATE),
        ...optimisticState,
      });

      try {
        const participant = await mutate();

        if (isDefined(participant)) {
          setParticipantState(threadId, toParticipantState(participant));
        }
      } catch (error) {
        setParticipantState(threadId, previousState);
        enqueueToast(getToastOptionsFromError({ error }));
      }
    },
    [enqueueToast, setParticipantState, store],
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
        mutate: async () =>
          (
            await client.mutate({
              mutation: MarkAgentChatThreadAsReadDocument,
              variables: { threadId },
            })
          ).data?.markAgentChatThreadAsRead,
      });
    },
    [client, store, updateParticipant],
  );

  const markAgentChatThreadAsUnread = useCallback(
    (threadId: string) =>
      updateParticipant({
        threadId,
        optimisticState: { lastReadAt: null },
        mutate: async () =>
          (
            await client.mutate({
              mutation: MarkAgentChatThreadAsUnreadDocument,
              variables: { threadId },
            })
          ).data?.markAgentChatThreadAsUnread,
      }),
    [client, updateParticipant],
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
        setParticipantState(threadId, previousState);
      };
    },
    [applyAgentChatThreadUpdate, setParticipantState, store],
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
