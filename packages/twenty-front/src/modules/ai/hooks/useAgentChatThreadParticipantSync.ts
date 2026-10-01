import { useStore } from 'jotai';
import { useCallback } from 'react';
import { type AgentChatThreadParticipantState } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components';

import { AGENT_CHAT_THREAD_PARTICIPANT_EMPTY_SYNC } from '@/ai/constants/AgentChatThreadParticipantEmptySync';
import {
  type AgentChatThreadParticipantSync,
  agentChatThreadParticipantSyncState,
} from '@/ai/states/agentChatThreadParticipantSyncState';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { toAgentChatThreadParticipantState } from '@/ai/utils/toAgentChatThreadParticipantState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { type AgentChatThreadParticipantFieldsFragment } from '~/generated-metadata/graphql';

const EMPTY_PARTICIPANT_STATE: AgentChatThreadParticipantState = {
  lastReadAt: null,
  archivedAt: null,
  snoozedUntil: null,
};

// Each local change to a thread's member state gets a version, so a late
// response or rollback never overwrites a newer change
export const useAgentChatThreadParticipantSync = () => {
  const store = useStore();
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

  const getSync = useCallback(
    (threadId: string) =>
      store.get(agentChatThreadParticipantSyncState.atom)[threadId] ??
      AGENT_CHAT_THREAD_PARTICIPANT_EMPTY_SYNC,
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
        [threadId]: update(
          syncs[threadId] ?? AGENT_CHAT_THREAD_PARTICIPANT_EMPTY_SYNC,
        ),
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
          setParticipantState(
            threadId,
            toAgentChatThreadParticipantState(participant),
          );
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

  return {
    setParticipantState,
    getSync,
    bumpVersion,
    updateParticipant,
  };
};
