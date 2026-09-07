import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';
import { ADD_QUERY_TO_EVENT_STREAM_MUTATION } from '@/sse-db-event/graphql/mutations/AddQueryToEventStreamMutation';
import { REMOVE_QUERY_FROM_EVENT_STREAM_MUTATION } from '@/sse-db-event/graphql/mutations/RemoveQueryFromEventStreamMutation';
import { lastRegisteredQueryListenersState } from '@/sse-db-event/states/lastRegisteredQueryListenersState';
import { requiredQueryListenersState } from '@/sse-db-event/states/requiredQueryListenersState';
import { shouldDestroyEventStreamState } from '@/sse-db-event/states/shouldDestroyEventStreamState';
import { sseEventStreamIdState } from '@/sse-db-event/states/sseEventStreamIdState';
import { sseEventStreamReadyState } from '@/sse-db-event/states/sseEventStreamReadyState';
import { isGracefullyHandledEventStreamError } from '@/sse-db-event/utils/isGracefullyHandledEventStreamError';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { captureException } from '@sentry/react';
import { useMutation } from '@apollo/client/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useStore } from 'jotai';
import { useCallback, useEffect } from 'react';
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
  const requiredQueryListeners = useAtomStateValue(requiredQueryListenersState);

  const [addQueryToEventStream] = useMutation<
    { addQueryToEventStream: boolean },
    { input: AddQuerySubscriptionInput }
  >(ADD_QUERY_TO_EVENT_STREAM_MUTATION);

  const [removeQueryFromEventStream] = useMutation<
    { removeQueryFromEventStream: boolean },
    { input: RemoveQueryFromEventStreamInput }
  >(REMOVE_QUERY_FROM_EVENT_STREAM_MUTATION);

  const destroyEventStreamIfStillCurrent = useCallback(
    (eventStreamId: string) => {
      if (store.get(sseEventStreamIdState.atom) !== eventStreamId) {
        return;
      }

      store.set(shouldDestroyEventStreamState.atom, true);
    },
    [store],
  );

  const handleError = useCallback(
    (eventStreamId: string, error: unknown) => {
      const extensions = getGraphqlErrorExtensionsFromError(error);

      if (
        !isGracefullyHandledEventStreamError({
          subCode: extensions?.subCode,
          code: extensions?.code,
        })
      ) {
        captureException(
          new Error(
            `Unhandled error for event stream: ${
              error instanceof Error ? error.message : String(error)
            }`,
            { cause: error },
          ),
        );
      }

      destroyEventStreamIfStillCurrent(eventStreamId);
    },
    [destroyEventStreamIfStillCurrent],
  );

  const syncRequiredQueries = useCallback(async () => {
    const eventStreamId = store.get(sseEventStreamIdState.atom);

    if (
      !isNonEmptyString(eventStreamId) ||
      !store.get(sseEventStreamReadyState.atom)
    ) {
      return;
    }

    const requiredQueryListeners = store.get(requiredQueryListenersState.atom);

    const queryListenersToRemove = store
      .get(lastRegisteredQueryListenersState.atom)
      .filter(
        (lastRegisteredListener) =>
          !requiredQueryListeners.some(
            (listener) => listener.queryId === lastRegisteredListener.queryId,
          ),
      );

    try {
      for (const queryListener of queryListenersToRemove) {
        const result = await removeQueryFromEventStream({
          variables: {
            input: { eventStreamId, queryId: queryListener.queryId },
          },
        });

        if (result.data?.removeQueryFromEventStream === false) {
          destroyEventStreamIfStillCurrent(eventStreamId);

          return;
        }
      }

      for (const queryListener of requiredQueryListeners) {
        const result = await addQueryToEventStream({
          variables: {
            input: {
              eventStreamId,
              queryId: queryListener.queryId,
              operationSignature: queryListener.operationSignature,
            },
          },
        });

        if (result.data?.addQueryToEventStream === false) {
          destroyEventStreamIfStillCurrent(eventStreamId);

          return;
        }
      }
    } catch (error) {
      handleError(eventStreamId, error);

      return;
    }

    store.set(lastRegisteredQueryListenersState.atom, requiredQueryListeners);
  }, [
    addQueryToEventStream,
    destroyEventStreamIfStillCurrent,
    handleError,
    removeQueryFromEventStream,
    store,
  ]);

  const debouncedSyncRequiredQueries = useDebouncedCallback(
    syncRequiredQueries,
    1000,
    { leading: true },
  );

  useEffect(() => {
    if (!isNonEmptyString(sseEventStreamId) || !sseEventStreamReady) {
      return;
    }

    debouncedSyncRequiredQueries();
  }, [
    sseEventStreamId,
    sseEventStreamReady,
    requiredQueryListeners,
    debouncedSyncRequiredQueries,
  ]);

  useListenToBrowserEvent({
    eventName: SSE_CLIENT_RECONNECTED_EVENT_NAME,
    onBrowserEvent: syncRequiredQueries,
  });

  return null;
};
