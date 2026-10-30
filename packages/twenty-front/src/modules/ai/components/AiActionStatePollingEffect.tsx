import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback, useEffect } from 'react';

import { AI_ACTION_STATE_MAX_POLL_INTERVAL_MS } from '@/ai/constants/AiActionStateMaxPollIntervalMs';
import { AI_ACTION_STATE_POLL_INTERVAL_MS } from '@/ai/constants/AiActionStatePollIntervalMs';
import { AI_ACTION_STATE_REFETCH_EVENT_NAME } from '@/ai/constants/AiActionStateRefetchEventName';
import { AI_INTERACTION_STATES } from '@/ai/graphql/queries/aiInteractionStates';
import { AI_TASK_STATES } from '@/ai/graphql/queries/aiTaskStates';
import { aiActionStateFamilyState } from '@/ai/states/aiActionStateFamilyState';
import { aiActionStatePollingState } from '@/ai/states/aiActionStatePollingState';
import { aiActionWatchedIdsState } from '@/ai/states/aiActionWatchedIdsState';
import { aiTaskStateFamilyState } from '@/ai/states/aiTaskStateFamilyState';
import { aiTaskWatchedIdsState } from '@/ai/states/aiTaskWatchedIdsState';
import { isAiActionStatePollable } from '@/ai/utils/isAiActionStatePollable';
import { isAiTaskStatePollable } from '@/ai/utils/isAiTaskStatePollable';
import { toAiActionStateEntry } from '@/ai/utils/toAiActionStateEntry';
import { toAiTaskStateEntry } from '@/ai/utils/toAiTaskStateEntry';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  type AiInteractionStatesQuery,
  type AiInteractionStatesQueryVariables,
  type AiTaskStatesQuery,
  type AiTaskStatesQueryVariables,
} from '~/generated-metadata/graphql';

type InteractionIds = { actionRequestIds?: string[]; taskIds?: string[] };

// One scheduler for every visible review and task card: ids are batched,
// requests never overlap, errors back off, and hidden tabs stop polling until
// they are shown again. Polling only reads state; it never starts a model run.
export const AiActionStatePollingEffect = () => {
  const apolloClient = useApolloClient();
  const store = useStore();
  const aiActionWatchedIds = useAtomStateValue(aiActionWatchedIdsState);
  const aiTaskWatchedIds = useAtomStateValue(aiTaskWatchedIdsState);

  const fetchStates = useCallback(
    async (onlyIds?: InteractionIds, { isForced = false } = {}) => {
      const polling = store.get(aiActionStatePollingState.atom);

      if (polling.isFetching || document.visibilityState === 'hidden') {
        return;
      }

      const actionRequestIds = (
        onlyIds?.actionRequestIds ??
        (onlyIds === undefined
          ? Object.keys(store.get(aiActionWatchedIdsState.atom))
          : [])
      ).filter(
        (id) =>
          isForced ||
          isAiActionStatePollable(
            store.get(aiActionStateFamilyState.atomFamily(id)),
          ),
      );
      const taskIds = (
        onlyIds?.taskIds ??
        (onlyIds === undefined
          ? Object.keys(store.get(aiTaskWatchedIdsState.atom))
          : [])
      ).filter(
        (id) =>
          isForced ||
          isAiTaskStatePollable(
            store.get(aiTaskStateFamilyState.atomFamily(id)),
          ),
      );

      if (actionRequestIds.length === 0 && taskIds.length === 0) {
        return;
      }

      store.set(aiActionStatePollingState.atom, {
        ...polling,
        isFetching: true,
      });

      let failureCount = polling.failureCount;

      try {
        const [actionsResult, tasksResult] = await Promise.all([
          actionRequestIds.length > 0
            ? apolloClient.query<
                AiInteractionStatesQuery,
                AiInteractionStatesQueryVariables
              >({
                query: AI_INTERACTION_STATES,
                variables: { input: { actionRequestIds } },
                fetchPolicy: 'no-cache',
              })
            : undefined,
          taskIds.length > 0
            ? apolloClient.query<AiTaskStatesQuery, AiTaskStatesQueryVariables>(
                {
                  query: AI_TASK_STATES,
                  variables: { input: { taskIds } },
                  fetchPolicy: 'no-cache',
                },
              )
            : undefined,
        ]);

        for (const state of actionsResult?.data?.aiInteractionStates.actions ??
          []) {
          store.set(
            aiActionStateFamilyState.atomFamily(state.requestedId),
            toAiActionStateEntry(state),
          );
        }

        for (const state of tasksResult?.data?.aiTaskStates.tasks ?? []) {
          store.set(
            aiTaskStateFamilyState.atomFamily(state.requestedId),
            toAiTaskStateEntry(state),
          );
        }

        failureCount = 0;
      } catch {
        failureCount += 1;
      } finally {
        store.set(aiActionStatePollingState.atom, {
          isFetching: false,
          failureCount,
        });
      }
    },
    [apolloClient, store],
  );

  // A newly mounted card is fetched at once rather than on the next tick.
  useEffect(() => {
    void fetchStates({
      actionRequestIds: Object.keys(aiActionWatchedIds).filter(
        (id) =>
          store.get(aiActionStateFamilyState.atomFamily(id)).status ===
          'loading',
      ),
      taskIds: Object.keys(aiTaskWatchedIds).filter(
        (id) =>
          store.get(aiTaskStateFamilyState.atomFamily(id)).status === 'loading',
      ),
    });
  }, [aiActionWatchedIds, aiTaskWatchedIds, fetchStates, store]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const scheduleNextPoll = () => {
      const { failureCount } = store.get(aiActionStatePollingState.atom);
      const delay = Math.min(
        AI_ACTION_STATE_POLL_INTERVAL_MS * 2 ** failureCount,
        AI_ACTION_STATE_MAX_POLL_INTERVAL_MS,
      );

      timeoutId = setTimeout(async () => {
        await fetchStates();
        scheduleNextPoll();
      }, delay);
    };

    const refetchVisibleStates = () => {
      if (document.visibilityState === 'visible') {
        void fetchStates();
      }
    };

    scheduleNextPoll();
    document.addEventListener('visibilitychange', refetchVisibleStates);
    window.addEventListener('focus', refetchVisibleStates);
    window.addEventListener('online', refetchVisibleStates);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', refetchVisibleStates);
      window.removeEventListener('focus', refetchVisibleStates);
      window.removeEventListener('online', refetchVisibleStates);
    };
  }, [fetchStates, store]);

  useListenToBrowserEvent({
    eventName: AI_ACTION_STATE_REFETCH_EVENT_NAME,
    onBrowserEvent: (detail?: InteractionIds) => {
      void fetchStates(
        {
          actionRequestIds: detail?.actionRequestIds ?? [],
          taskIds: detail?.taskIds ?? [],
        },
        { isForced: true },
      );
    },
  });

  return null;
};
