import { ADD_QUERY_TO_EVENT_STREAM_MUTATION } from '@/sse-db-event/graphql/mutations/AddQueryToEventStreamMutation';
import { REMOVE_QUERY_FROM_EVENT_STREAM_MUTATION } from '@/sse-db-event/graphql/mutations/RemoveQueryFromEventStreamMutation';
import { activeQueryListenersState } from '@/sse-db-event/states/activeQueryListenersState';
import { requiredQueryListenersState } from '@/sse-db-event/states/requiredQueryListenersState';
import { shouldDestroyEventStreamState } from '@/sse-db-event/states/shouldDestroyEventStreamState';
import { sseEventStreamIdState } from '@/sse-db-event/states/sseEventStreamIdState';
import { sseEventStreamReadyState } from '@/sse-db-event/states/sseEventStreamReadyState';
import { isGracefullyHandledEventStreamError } from '@/sse-db-event/utils/isGracefullyHandledEventStreamError';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useStore } from 'jotai';
import { useCallback, useEffect } from 'react';
import {
  compareArraysOfObjectsByProperty,
  isDefined,
} from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';
import {
  type AddQuerySubscriptionInput,
  type RemoveQueryFromEventStreamInput,
} from '~/generated-metadata/graphql';
import { getGraphqlErrorExtensionsFromError } from '~/utils/get-graphql-error-extensions-from-error.util';

export const SSEQuerySubscribeEffect = () => {
  const store = useStore();
  const sseEventStreamId = useAtomStateValue(sseEventStreamIdState);
  const sseEventStreamReady = useAtomStateValue(sseEventStreamReadyState);

  const [addQueryToEventStream] = useMutation<
    { addQueryToEventStream: boolean },
    { input: AddQuerySubscriptionInput }
  >(ADD_QUERY_TO_EVENT_STREAM_MUTATION);

  const [removeQueryFromEventStream] = useMutation<
    { removeQueryFromEventStream: boolean },
    { input: RemoveQueryFromEventStreamInput }
  >(REMOVE_QUERY_FROM_EVENT_STREAM_MUTATION);

  const requiredQueryListeners = useAtomStateValue(requiredQueryListenersState);
  const activeQueryListeners = useAtomStateValue(activeQueryListenersState);

  const handleError = useCallback(
    (error: unknown) => {
      if (CombinedGraphQLErrors.is(error)) {
        const extensions = getGraphqlErrorExtensionsFromError(error);

        if (
          isGracefullyHandledEventStreamError({
            subCode: extensions?.subCode,
            code: extensions?.code,
          })
        ) {
          store.set(activeQueryListenersState.atom, []);
          store.set(shouldDestroyEventStreamState.atom, true);

          return;
        }

        throw new Error(`Unhandled error for event stream: ${error.message}`);
      }
    },
    [store],
  );

  const syncAdditions = useCallback(async () => {
    if (!isDefined(sseEventStreamId)) {
      return;
    }

    const requiredQueryListeners = store.get(requiredQueryListenersState.atom);
    const activeQueryListeners = store.get(activeQueryListenersState.atom);

    const queryListenersToAdd = requiredQueryListeners.filter(
      (listener) =>
        !activeQueryListeners.some(
          (activeListener) => activeListener.queryId === listener.queryId,
        ),
    );

    if (queryListenersToAdd.length === 0) {
      return;
    }

    try {
      for (const queryListenerToAdd of queryListenersToAdd) {
        const result = await addQueryToEventStream({
          variables: {
            input: {
              eventStreamId: sseEventStreamId,
              queryId: queryListenerToAdd.queryId,
              operationSignature: queryListenerToAdd.operationSignature,
            },
          },
        });

        if (result.data?.addQueryToEventStream === false) {
          store.set(activeQueryListenersState.atom, []);
          store.set(shouldDestroyEventStreamState.atom, true);

          return;
        }
      }
    } catch (error) {
      handleError(error);

      return;
    }

    const currentActive = store.get(activeQueryListenersState.atom);

    store.set(activeQueryListenersState.atom, [
      ...currentActive,
      ...queryListenersToAdd,
    ]);
  }, [addQueryToEventStream, handleError, sseEventStreamId, store]);

  const syncRemovals = useCallback(async () => {
    if (!isDefined(sseEventStreamId)) {
      return;
    }

    const freshRequiredQueryListeners = store.get(
      requiredQueryListenersState.atom,
    );
    const activeQueryListeners = store.get(activeQueryListenersState.atom);

    const queryListenersToRemove = activeQueryListeners.filter(
      (listener) =>
        !freshRequiredQueryListeners.some(
          (requiredListener) => requiredListener.queryId === listener.queryId,
        ),
    );

    if (queryListenersToRemove.length === 0) {
      return;
    }

    const removedQueryIds = new Set(
      queryListenersToRemove.map((listener) => listener.queryId),
    );

    try {
      for (const queryListenerToRemove of queryListenersToRemove) {
        const result = await removeQueryFromEventStream({
          variables: {
            input: {
              eventStreamId: sseEventStreamId,
              queryId: queryListenerToRemove.queryId,
            },
          },
        });

        if (result.data?.removeQueryFromEventStream === false) {
          store.set(activeQueryListenersState.atom, []);
          store.set(shouldDestroyEventStreamState.atom, true);

          return;
        }
      }
    } catch (error) {
      handleError(error);

      return;
    }

    const currentActive = store.get(activeQueryListenersState.atom);

    store.set(
      activeQueryListenersState.atom,
      currentActive.filter(
        (listener) => !removedQueryIds.has(listener.queryId),
      ),
    );
  }, [handleError, removeQueryFromEventStream, sseEventStreamId, store]);

  const debouncedSyncAdditions = useDebouncedCallback(syncAdditions, 1000, {
    leading: true,
  });

  const debouncedSyncRemovals = useDebouncedCallback(syncRemovals, 200, {
    leading: false,
  });

  useEffect(() => {
    if (!isNonEmptyString(sseEventStreamId) || !sseEventStreamReady) {
      return;
    }

    const areDifferent = compareArraysOfObjectsByProperty(
      requiredQueryListeners,
      activeQueryListeners,
      'queryId',
    );

    if (!areDifferent) {
      return;
    }

    const hasAdditions = requiredQueryListeners.some(
      (listener) =>
        !activeQueryListeners.some(
          (activeListener) => activeListener.queryId === listener.queryId,
        ),
    );

    const hasRemovals = activeQueryListeners.some(
      (listener) =>
        !requiredQueryListeners.some(
          (requiredListener) => requiredListener.queryId === listener.queryId,
        ),
    );

    if (hasAdditions) {
      debouncedSyncAdditions();
    }

    if (hasRemovals) {
      debouncedSyncRemovals();
    }
  }, [
    sseEventStreamId,
    sseEventStreamReady,
    requiredQueryListeners,
    activeQueryListeners,
    debouncedSyncAdditions,
    debouncedSyncRemovals,
  ]);

  return null;
};
